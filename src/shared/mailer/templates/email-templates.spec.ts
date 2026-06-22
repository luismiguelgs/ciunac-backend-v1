import { getTemplate } from './email-templates';

describe('email templates', () => {
  it('should render the rejected solicitud template with its reason', () => {
    const template = getTemplate({
      type: 'SOLICITUD_RECHAZADA',
      email: 'estudiante@ciunac.edu.pe',
      motivo: 'Voucher invalido',
    });

    expect(template.subject).toBe('CIUNAC - SOLICITUD RECHAZADA');
    expect(template.text).toContain('Voucher invalido');
    expect(template.html).toContain('Voucher invalido');
  });
});
