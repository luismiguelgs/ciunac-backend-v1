import { validate } from 'class-validator';
import { RejectSolicitudDto } from './reject-solicitud.dto';

describe('RejectSolicitudDto', () => {
  it('should accept valid observations', async () => {
    const dto = new RejectSolicitudDto();
    dto.observaciones = 'Voucher invalido';

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each(['', '   '])('should reject empty observations', async (value) => {
    const dto = new RejectSolicitudDto();
    dto.observaciones = value;

    const errors = await validate(dto);

    expect(errors).not.toHaveLength(0);
  });

  it('should reject observations longer than 1000 characters', async () => {
    const dto = new RejectSolicitudDto();
    dto.observaciones = 'a'.repeat(1001);

    const errors = await validate(dto);

    expect(errors).not.toHaveLength(0);
  });
});
