import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PerfilDocente } from 'src/modules/seguimiento_docente/perfil_docente/entities/perfil_docente.entity';
import { TipoDocumentoPerfil } from 'src/modules/seguimiento_docente/tipo_documento_perfil/entities/tipo_documento_perfil.entity';
import { Estado } from 'src/modules/auxiliares/estados/entities/estado.entity';

@Entity('documentos_docente')
export class DocumentosDocente {
    @PrimaryGeneratedColumn()
    id: number;

    // Llaves foráneas
    @Column({ name: 'perfil_docente_id', nullable: false })
    perfilDocenteId: number;

    @Column({ name: 'tipo_documento_perfil_id', nullable: false })
    tipoDocumentoPerfilId: number;

    @Column({ name: 'estado_id', nullable: false })
    estadoId: number;

    // Campos de datos
    @Column({ nullable: false })
    descripcion: string;

    @Column({ name: 'institucion_emisora', nullable: false })
    institucionEmisora: string;

    @Column({ name: 'url_archivo', nullable: false })
    urlArchivo: string;

    @Column({ name: 'fecha_emision', type: 'date', nullable: true })
    fechaEmision: Date;

    // Campos numéricos con valores por defecto
    @Column({ name: 'horas_capacitacion', type: 'int', default: 0 })
    horasCapacitacion: number;

    @Column({ type: 'int', default: 0 })
    puntaje: number;

    @Column({ name: 'experiencia_laboral', type: 'int', default: 0 })
    experienciaLaboral: number;

    // Auditoría
    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'modificado_en' })
    modificadoEn: Date;

    // Relaciones
    @ManyToOne(() => PerfilDocente, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'perfil_docente_id' })
    perfilDocente: PerfilDocente;

    @ManyToOne(() => TipoDocumentoPerfil)
    @JoinColumn({ name: 'tipo_documento_perfil_id' })
    tipoDocumentoPerfil: TipoDocumentoPerfil;

    @ManyToOne(() => Estado)
    @JoinColumn({ name: 'estado_id' })
    estado: Estado;
}
