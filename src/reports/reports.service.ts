import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  createEstimate({ make, lat, lng, model, year, mileage }: GetEstimateDto) {
    return this.reportsRepo
      .createQueryBuilder()
      .select('*')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS true')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawMany();
  }
  constructor(
    @InjectRepository(Report) private reportsRepo: Repository<Report>,
  ) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.reportsRepo.create(reportDto);

    report.user = user;

    return this.reportsRepo.save(report);
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.reportsRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['user'],
    });

    if (!report) throw new NotFoundException('report not found');

    report.approved = approved;

    return this.reportsRepo.save(report);
  }
}
