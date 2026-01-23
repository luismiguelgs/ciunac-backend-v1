import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AcademicoAdministrativo } from '../../academico_administrativo/entities/academico_administrativo.entity';

@Entity('puntaje_academico_administrativo')
export class PuntajeAcademicoAdministrativo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'academico_administrativo_id' })
    academicoAdministrativoId: number;

    @Column()
    nombre: string;

    @Column()
    puntaje: number;

    @ManyToOne(() => AcademicoAdministrativo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'academico_administrativo_id' })
    academicoAdministrativo: AcademicoAdministrativo;
}
