import { TipoEstudiante } from 'src/shared/types/tipo-academico';

export interface SyncEstudianteQ10Input {
  idQ10: string;
  nombres: string;
  apellidos: string;
  genero: string;
  fechaNacimiento: Date;
  tipoDocumento: string;
  numeroDocumento: string;
  celular: string;
  direccion?: string;
  email?: string;
  facultadId?: number | null;
  escuelaId?: number | null;
  tipoEstudiante?: TipoEstudiante | null;
  imgDoc?: string | null;
}
