import { Grupo } from 'src/modules/estructura/grupos/entities/grupo.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('modulos')
export class Modulo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ name: 'fecha_inicio', type: 'date' })
    fechaInicio: Date;

    @Column({ name: 'fecha_fin', type: 'date' })
    fechaFin: Date;

    @Column({ type: 'int', default: 0 })
    orden: number;

    //Relaciones
    @OneToMany(() => Grupo, (grupo) => grupo.modulo)
    grupos: Grupo[];
}

