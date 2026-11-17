import { ApiProperty } from '@nestjs/swagger';

export class Q10EstudianteLocalResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Q10-12345' })
  idQ10: string;

  @ApiProperty({ example: '12345678' })
  numeroDocumento: string;
}

export class Q10EstudianteRegistrationResponseDto {
  @ApiProperty({ example: 'COMPLETED' })
  status: 'COMPLETED';

  @ApiProperty({ type: Q10EstudianteLocalResponseDto })
  estudiante: Q10EstudianteLocalResponseDto;

  @ApiProperty({ example: true })
  programaRegistrado: true;
}

export class Q10PartialFailureResponseDto {
  @ApiProperty({
    enum: [
      'Q10_UNAVAILABLE',
      'Q10_CREATED_LOCAL_SYNC_FAILED',
      'Q10_CREATED_PROGRAM_PENDING',
      'Q10_CREATED_INVALID_RESPONSE',
    ],
  })
  code: string;

  @ApiProperty({
    example: 'Q10 creo al estudiante, pero fallo la sincronizacion local',
  })
  message: string;

  @ApiProperty({
    example: false,
    description:
      'true solo para Q10_UNAVAILABLE; false para los fallos posteriores al alta remota. No repetir automaticamente altas parciales.',
  })
  retryAllowed: boolean;

  @ApiProperty({ required: false, format: 'uuid' })
  estudianteId?: string;

  @ApiProperty({ required: false, example: 'Q10-12345' })
  idQ10?: string;
}
