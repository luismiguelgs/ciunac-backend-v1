import { Modulo } from "src/modules/estructura/modulos/entities/modulo.entity";
import { Docente } from "src/modules/principales/docentes/entities/docente.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('encuesta_metricas_docente')
@Index(['docenteId', 'moduloId'], { unique: true })
export class EncuestaMetricasDocente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'docente_id', type: 'varchar', nullable: false })
    docenteId: string;

    @Column({ name: 'modulo_id', type: 'integer', nullable: false })
    moduloId: number;

    @Column({ name: 'promedio_general', type: 'decimal', precision: 5, scale: 2 })
    promedioGeneral: number;

    @Column({ name: 'total_encuestados', type: 'integer' })
    totalEncuestados: number;

    @Column({ name: 'total_cursos', type: 'integer' })
    totalCursos: number;

    @Column({ name: 'fecha_registro', type: 'timestamp' })
    fechaRegistro: Date;

    //RELACIONES
    @ManyToOne(() => Docente)
    @JoinColumn({ name: 'docente_id' })
    docente: Docente;

    @ManyToOne(() => Modulo)
    @JoinColumn({ name: 'modulo_id' })
    modulo: Modulo;
}
