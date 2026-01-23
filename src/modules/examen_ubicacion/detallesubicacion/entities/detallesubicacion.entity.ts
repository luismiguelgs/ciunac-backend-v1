import { Nivel } from 'src/modules/estructura/niveles/entities/nivel.entity';
import { Examenesubicacion } from 'src/modules/examen_ubicacion/examenesubicacion/entities/examenesubicacion.entity';
import { Calificacionesubicacion } from 'src/modules/examen_ubicacion/calificacionesubicacion/entities/calificacionesubicacion.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Estudiante } from 'src/modules/principales/estudiantes/entities/estudiante.entity';
import { Idioma } from 'src/modules/estructura/idiomas/entities/idioma.entity';

@Entity('detalles_ubicacion')
export class Detallesubicacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'solicitud_id', nullable: false })
    solicitudId: number;

    @Column({ name: 'idioma_id', nullable: false })
    idiomaId: number;

    @Column({ name: 'nivel_id', nullable: false })
    nivelId: number;

    @Column({ name: 'examen_id', nullable: false })
    examenId: number;

    @Column({ name: 'estudiante_id', nullable: false })
    estudianteId: string;

    @Column({ name: 'nota', nullable: false })
    nota: number;

    @Column({ name: 'calificacion_id', nullable: false })
    calificacionId: number;

    @Column({ name: 'terminado', nullable: false })
    terminado: boolean;

    @Column({ default: true })
    activo: boolean;

    @Column({ name: 'creado_en', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ name: 'modificado_en', default: () => 'CURRENT_TIMESTAMP' })
    modificadoEn: Date;

    //Relaciones
    @ManyToOne(() => Idioma)
    @JoinColumn({ name: 'idioma_id' })
    idioma: Idioma;

    @ManyToOne(() => Nivel)
    @JoinColumn({ name: 'nivel_id' })
    nivel: Nivel;

    @ManyToOne(() => Estudiante)
    @JoinColumn({ name: 'estudiante_id' })
    estudiante: Estudiante;

    @ManyToOne(() => Examenesubicacion)
    @JoinColumn({ name: 'examen_id' })
    examen: Examenesubicacion;

    @ManyToOne(() => Calificacionesubicacion)
    @JoinColumn({ name: 'calificacion_id' })
    calificacion: Calificacionesubicacion;
}
