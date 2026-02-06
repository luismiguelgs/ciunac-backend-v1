import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Docente } from 'src/modules/principales/docentes/entities/docente.entity';
import { EncuestaRespuestasDetalle } from 'src/modules/seguimiento_docente/encuesta_respuestas_detalle/entities/encuesta_respuestas_detalle.entity';

@Entity('encuesta_respuestas')
export class EncuestaRespuesta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'docente_id', type: 'varchar', nullable: false })
    docenteId: string;

    @Column({ type: 'varchar' })
    periodo: string;

    @Column({ type: 'varchar' })
    grupo: string;

    @Column({ type: 'varchar' })
    estudiante: string;

    @Column({ name: 'promedio_individual', type: 'decimal', precision: 5, scale: 2 })
    promedioIndividual: number;

    @Column({ type: 'text', nullable: true })
    comentario: string;

    @CreateDateColumn({ name: 'fecha_registro' })
    fechaRegistro: Date;

    // Relación
    @OneToMany(() => EncuestaRespuestasDetalle, (detalle) => detalle.respuesta, { cascade: true })
    detalles: EncuestaRespuestasDetalle[];

    @ManyToOne(() => Docente)
    @JoinColumn({ name: 'docente_id' })
    docente: Docente;
}

