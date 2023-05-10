import { rm } from 'fs';
import { join } from 'path';

global.beforeEach(async () => {
  //it will run before each test
  //   rm();
  await rm(join(__dirname, '..', 'test.sqlite'), console.log);
});
