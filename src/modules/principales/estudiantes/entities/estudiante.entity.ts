import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Usuario } from 'src/modules/usuarios/usuarios/entities/usuario.entity';
import { Facultad } from 'src/modules/auxiliares/facultades/entities/facultad.entity';
import { Escuela } from 'src/modules/auxiliares/escuelas/entities/escuela.entity';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';


@Entity('estudiantes')
export class Estudiante {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombres: string;

    @Column()
    apellidos: string;

    @Column()
    genero: string;

    @Column({ name: 'fecha_nacimiento', type: 'date' })
    fechaNacimiento: Date;

    @Column({ name: 'tipo_documento' })
    tipoDocumento: string;

    @Column({ name: 'numero_documento' })
    numeroDocumento: string;

    @Column()
    celular: string;

    @Column({ name: 'img_doc', nullable: true })
    imgDoc: string;

    @Column({ name: 'facultad_id', nullable: true })
    facultadId?: number;

    @Column({ name: 'escuela_id', nullable: true })
    escuelaId?: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    codigo: string;

    @Column({ nullable: true })
    direccion: string;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'modificado_en' })
    modificadoEn: Date;

    // Relación 1:1 con Usuario
    @OneToOne(() => Usuario, (usuario) => usuario.estudiante)
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    // Un estudiante pertenece a una facultad
    @ManyToOne(() => Facultad, (facultad) => facultad.estudiantes, { nullable: true })
    @JoinColumn({ name: 'facultad_id' })
    facultad?: Facultad;

    // Un estudiante pertenece a una escuela
    @ManyToOne(() => Escuela, (escuela) => escuela.estudiantes, { nullable: true })
    @JoinColumn({ name: 'escuela_id' })
    escuela?: Escuela;

    @OneToMany(() => Solicitud, (solicitud) => solicitud.estudiante)
    solicitudes: Solicitud[];
}

