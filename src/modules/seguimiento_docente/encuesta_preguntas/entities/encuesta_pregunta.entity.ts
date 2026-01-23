import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('encuesta_preguntas')
export class EncuestaPregunta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    orden: number;

    @Column({ name: 'texto_pregunta', type: 'varchar', nullable: false })
    textoPregunta: string;

    @Column({ type: 'varchar', nullable: true })
    dimension: string;

    @Column({ type: 'boolean', default: true, nullable: false })
    activo: boolean;
}

