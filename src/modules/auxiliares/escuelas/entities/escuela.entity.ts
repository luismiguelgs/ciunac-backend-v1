import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { Facultad } from '../../facultades/entities/facultad.entity';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';

@Entity('escuelas')
export class Escuela {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ name: 'facultad_id', nullable: false })
    facultadId: number;

    // Muchas escuelas pertenecen a una facultad
    @ManyToOne(() => Facultad, (facultad) => facultad.escuelas, { nullable: false })
    @JoinColumn({ name: 'facultad_id' })
    facultad: Facultad;

    // Una escuela tiene muchos estudiantes
    @OneToMany(() => Estudiante, (estudiante) => estudiante.escuela)
    estudiantes: Estudiante[];
}
