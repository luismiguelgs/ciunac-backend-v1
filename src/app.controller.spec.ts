import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = {
    getHello: jest.fn().mockReturnValue('CIUNAC Backend test'),
    generarToken: jest.fn().mockReturnValue('token'),
    validarToken: jest.fn().mockReturnValue({ sub: 1 }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the service status message', () => {
      expect(appController.getHello()).toBe('CIUNAC Backend test');
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
