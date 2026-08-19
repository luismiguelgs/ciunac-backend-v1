import { getPasswordResetTemplate, getTemplate } from './email-templates';

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

  it('renders a single-use password reset link and expiration', () => {
    const resetUrl =
      'https://admin.ciunac.site/restablecer-contrasena?token=abc&source=email';

    const template = getPasswordResetTemplate(resetUrl, 30);

    expect(template.subject).toBe('CIUNAC - RECUPERACIÓN DE CONTRASEÑA');
    expect(template.text).toContain(resetUrl);
    expect(template.text).toContain('30 minutos');
    expect(template.html).toContain(
      'https://admin.ciunac.site/restablecer-contrasena?token=abc&amp;source=email',
    );
    expect(template.html).toContain('un solo uso');
  });
});
