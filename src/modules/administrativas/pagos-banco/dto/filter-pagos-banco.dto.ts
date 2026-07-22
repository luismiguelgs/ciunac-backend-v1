import { IsDefined, Matches } from 'class-validator';

export class FilterPagosBancoDto {
  @IsDefined({ message: 'El periodo es obligatorio.' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'El periodo debe tener el formato YYYY-MM y un mes valido.',
  })
  periodo: string;
}
