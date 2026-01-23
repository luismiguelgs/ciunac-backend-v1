import { Estudiante } from "src/modules/principales/estudiantes/entities/estudiante.entity";
import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Tipossolicitud } from "src/modules/administrativas/tipossolicitud/entities/tipossolicitud.entity";
import { Idioma } from "src/modules/estructura/idiomas/entities/idioma.entity";
import { Nivel } from "src/modules/estructura/niveles/entities/nivel.entity";
import { Estado } from "src/modules/auxiliares/estados/entities/estado.entity";

@Entity('solicitudes')
export class Solicitud {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'estudiante_id' })
    estudianteId: string;

    @Column({ name: 'tipo_solicitud_id' })
    tipoSolicitudId: number;

    @Column({ name: 'idioma_id', nullable: false })
    idiomaId: number;

    @Column({ name: 'nivel_id', nullable: false })
    nivelId: number;

    @Column({ name: 'estado_id', nullable: false })
    estadoId: number;

    @Column()
    periodo: string;

    @Column({ name: 'alumno_ciunac', default: false })
    alumnoCiunac: boolean;

    @Column({ name: 'fecha_pago' })
    fechaPago: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
    pago: number;

    @Column({ name: 'numero_voucher' })
    numeroVoucher: string;

    @Column({ name: 'img_voucher', type: 'varchar', nullable: true })
    imgVoucher: string;

    @Column({ name: 'img_cert_estudio', nullable: true })
    imgCertEstudio: string;

    @Column({ type: 'boolean', default: false })
    digital: boolean;

    @Column({ name: 'manual', default: false })
    manual: boolean;

    @Column({ name: 'creado_en' })
    creadoEn: Date;

    @Column({ name: 'modificado_en' })
    modificadoEn: Date;

    //relaciones
    @ManyToOne(() => Estudiante, (estudiante) => estudiante.solicitudes)
    @JoinColumn({ name: 'estudiante_id' })
    estudiante: Estudiante;

    @ManyToOne(() => Tipossolicitud)
    @JoinColumn({ name: 'tipo_solicitud_id' })
    tiposSolicitud: Tipossolicitud;

    @ManyToOne(() => Idioma)
    @JoinColumn({ name: 'idioma_id' })
    idioma: Idioma;

    @ManyToOne(() => Nivel)
    @JoinColumn({ name: 'nivel_id' })
    nivel: Nivel;

    @ManyToOne(() => Estado, (estado) => estado.solicitudes)
    @JoinColumn({ name: 'estado_id' })
    estado: Estado;
}
