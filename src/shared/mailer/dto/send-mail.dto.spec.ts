import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SendMailDto } from './send-mail.dto';

describe('SendMailDto', () => {
  it('does not expose password recovery through the generic mail endpoint', async () => {
    const dto = plainToInstance(SendMailDto, {
      type: 'PASSWORD_RESET',
      email: 'usuario@ciunac.edu.pe',
    });

    expect(await validate(dto)).not.toHaveLength(0);
  });
});
