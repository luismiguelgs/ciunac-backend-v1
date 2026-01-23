import { Solicitud } from "src/modules/administrativas/solicitudes/entities/solicitud.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm";

export enum EstadoReferencia {
  SOLICITUD = 'SOLICITUD',
  EXAMEN_UBICACION = 'EXAMEN_UBICACION',
  CERTIFICADO = 'CERTIFICADO'
}

@Entity('estados')
export class Estado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: EstadoReferencia,
    default: EstadoReferencia.SOLICITUD
  })
  referencia: EstadoReferencia;

  //Relaciones
  @OneToMany(() => Solicitud, (solicitud) => solicitud.estado)
  solicitudes: Solicitud[];

}
