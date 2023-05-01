import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDTO } from './dtos/update-user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth')
@Serialize(UserDto)
// @UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  // @Get('/whoami')
  // whoami(@Session() session) {
  //   return this.userService.findOne(session.userId);
  // }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoami(@CurrentUser() user: User) {
    return user;
  }

  @Post('/signup')
  async createUser(@Body() user: CreateUserDto, @Session() session) {
    const createdUser = await this.authService.signup(
      user.email,
      user.password,
    );

    session.userId = createdUser.id;

    return createdUser;
  }

  @Post('/signin')
  @HttpCode(200)
  async signin(@Body() user: CreateUserDto, @Session() session) {
    const loggedInUser = await this.authService.signin(
      user.email,
      user.password,
    );

    session.userId = loggedInUser.id;

    return loggedInUser;
  }

  @Post('/signout')
  @HttpCode(200)
  signout(@Session() session) {
    session.userId = null;
  }

  @Get('/:id')
  findUser(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() newUser: UpdateUserDTO) {
    return this.userService.update(+id, newUser);
  }
}
