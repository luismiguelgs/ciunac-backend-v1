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

export class Q10ValidationIssueDto {
  @ApiProperty({ example: 'escuelaId' })
  field: string;

  @ApiProperty({ type: [String], example: ['SCHOOL_TYPE_MISMATCH'] })
  rules: string[];
}

export class Q10RegistrationErrorResponseDto {
  @ApiProperty({ example: 'Q10_LOCAL_VALIDATION_FAILED' })
  code: string;

  @ApiProperty({ example: 'Los datos del estudiante no son validos' })
  message: string;

  @ApiProperty({ example: false, enum: [false] })
  retryAllowed: boolean;

  @ApiProperty({ required: false, example: 400 })
  statusCode?: number;

  @ApiProperty({ required: false, format: 'uuid' })
  operationId?: string;

  @ApiProperty({ required: false, example: 'LOCAL_VALIDATION' })
  stage?: string;

  @ApiProperty({ required: false, enum: ['request', 'local', 'q10'] })
  origin?: string;

  @ApiProperty({ required: false, type: [Q10ValidationIssueDto] })
  validationErrors?: Q10ValidationIssueDto[];
}

export class Q10PartialFailureResponseDto extends Q10RegistrationErrorResponseDto {
  @ApiProperty({
    enum: [
      'Q10_UNAVAILABLE',
      'Q10_PERIOD_LOOKUP_FAILED',
      'Q10_CREATED_LOCAL_SYNC_FAILED',
      'Q10_CREATED_PROGRAM_PENDING',
      'Q10_CREATED_INVALID_RESPONSE',
    ],
  })
  declare code: string;

  @ApiProperty({ required: false, format: 'uuid' })
  estudianteId?: string;

  @ApiProperty({ required: false, example: 'Q10-12345' })
  idQ10?: string;
}
