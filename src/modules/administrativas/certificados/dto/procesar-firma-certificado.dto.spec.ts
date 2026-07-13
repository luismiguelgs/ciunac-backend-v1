import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProcesarFirmaCertificadoDto } from './procesar-firma-certificado.dto';

describe('ProcesarFirmaCertificadoDto', () => {
  it('accepts the minimal request', async () => {
    const dto = plainToInstance(ProcesarFirmaCertificadoDto, {
      certificadoId: 'certificado-1',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('transforms solicitudId and accepts compatibility ids', async () => {
    const dto = plainToInstance(ProcesarFirmaCertificadoDto, {
      certificadoId: 'certificado-1',
      fileId: 'original-id',
      solicitudId: '123',
      signedFileId: 'signed-id',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.solicitudId).toBe(123);
  });

  it('rejects empty ids', async () => {
    const dto = plainToInstance(ProcesarFirmaCertificadoDto, {
      certificadoId: '',
      fileId: '',
      signedFileId: '',
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['certificadoId', 'fileId', 'signedFileId']),
    );
  });
});
