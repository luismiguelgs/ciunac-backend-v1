import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{43}$/, {
    message: 'token debe ser un token de recuperación válido',
  })
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  @MaxLength(72, {
    message: 'La nueva contraseña no puede superar los 72 caracteres',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'La confirmación debe tener al menos 8 caracteres',
  })
  @MaxLength(72, {
    message: 'La confirmación no puede superar los 72 caracteres',
  })
  confirmPassword: string;
}
