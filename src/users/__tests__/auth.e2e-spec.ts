import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', () => {
    const email = 'tesing123@t.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '123345' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual('tesing123@t.com');
      });
  });

  it('signup as a new user then get the currenlty loggedin user', async () => {
    const email = 't@t.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '123345' })
      .expect(201);

    const cookie = res.get('Set-Cookie');

    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);

    expect(body.email).toEqual(email);
    expect(body.id).toBeDefined();
  });
});
