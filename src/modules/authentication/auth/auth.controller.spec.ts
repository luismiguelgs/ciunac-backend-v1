import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    forgotPassword: jest.Mock;
    resetPassword: jest.Mock;
  };

  beforeEach(() => {
    authService = {
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('delegates forgot-password to AuthService', async () => {
    const response = {
      message:
        'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    };
    authService.forgotPassword.mockResolvedValue(response);

    await expect(
      controller.forgotPassword({ email: 'usuario@ciunac.edu.pe' }),
    ).resolves.toEqual(response);
    expect(authService.forgotPassword).toHaveBeenCalledWith(
      'usuario@ciunac.edu.pe',
    );
  });

  it('delegates reset-password to AuthService', async () => {
    const dto = {
      token: 'a'.repeat(43),
      newPassword: 'nueva-clave',
      confirmPassword: 'nueva-clave',
    };
    authService.resetPassword.mockResolvedValue({
      message: 'Contraseña actualizada correctamente.',
    });

    await controller.resetPassword(dto);

    expect(authService.resetPassword).toHaveBeenCalledWith(dto);
  });
});
