import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProcesarFirmaDto } from './procesar-firma.dto';

describe('ProcesarFirmaDto', () => {
  it('accepts the minimal request', async () => {
    const dto = plainToInstance(ProcesarFirmaDto, {
      constanciaId: 'constancia-1',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('keeps compatibility and transforms solicitudId', async () => {
    const dto = plainToInstance(ProcesarFirmaDto, {
      constanciaId: 'constancia-1',
      fileId: 'original-id',
      solicitudId: '123',
      signedFileId: 'signed-id',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.solicitudId).toBe(123);
  });

  it('rejects empty optional file ids', async () => {
    const dto = plainToInstance(ProcesarFirmaDto, {
      constanciaId: 'constancia-1',
      fileId: '',
      signedFileId: '',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['fileId', 'signedFileId']),
    );
  });
});
