import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Facultad } from '../../facultades/entities/facultad.entity';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TIPOS_ESCUELA, TipoEscuela } from 'src/shared/types/tipo-academico';

@Entity('escuelas')
export class Escuela {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ name: 'facultad_id', nullable: false })
  facultadId: number;

  @ApiPropertyOptional({
    type: String,
    enum: [...TIPOS_ESCUELA],
    nullable: true,
  })
  @Column({ type: 'varchar', length: 3, nullable: true })
  tipo?: TipoEscuela | null;

  // Muchas escuelas pertenecen a una facultad
  @ManyToOne(() => Facultad, (facultad) => facultad.escuelas, {
    nullable: false,
  })
  @JoinColumn({ name: 'facultad_id' })
  facultad: Facultad;

  // Una escuela tiene muchos estudiantes
  @OneToMany(() => Estudiante, (estudiante) => estudiante.escuela)
  estudiantes: Estudiante[];
}
