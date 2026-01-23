import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('academico_administrativo')
export class AcademicoAdministrativo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    nombre: string;

    @Column({ type: 'float', nullable: false })
    peso: number;
}
