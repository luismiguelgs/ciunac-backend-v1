import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { Escuela } from 'src/modules/auxiliares/escuelas/entities/escuela.entity';

@Entity('facultades')
export class Facultad {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    codigo: string;

    // Una facultad tiene muchas escuelas
    @OneToMany(() => Escuela, (escuela) => escuela.facultad)
    escuelas: Escuela[];

    // Una facultad tiene muchos estudiantes (relación directa)
    @OneToMany(() => Estudiante, (estudiante) => estudiante.facultad)
    estudiantes: Estudiante[];
}
