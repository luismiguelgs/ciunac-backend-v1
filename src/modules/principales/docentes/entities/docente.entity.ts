import { Usuario } from "src/modules/authentication/usuarios/entities/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { PerfilDocente } from "src/modules/seguimiento_docente/perfil_docente/entities/perfil_docente.entity";

@Entity('docentes')
export class Docente {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'usuario_id', unique: true, nullable: true })
    usuario_id: string;

    @Column({
        nullable: false,
        type: 'varchar',
    })
    nombres: string;

    @Column({
        nullable: false,
        type: 'varchar',
    })
    apellidos: string;

    @Column()
    genero: string; // M o F

    @Column()
    celular: string;

    @Column({ name: 'fecha_nacimiento', type: 'date' })
    fechaNacimiento: Date;

    @Column({ name: 'numero_documento', type: 'varchar', unique: true, nullable: true })
    numeroDocumento: string;

    @Column({ name: 'tipo_documento', type: 'varchar', nullable: true })
    tipoDocumento: string;

    @Column({ default: true })
    activo?: boolean;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'modificado_en' })
    modificadoEn: Date;

    // Relación 1:1 con Usuario
    @OneToOne(() => Usuario, (usuario) => usuario.docente)
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @OneToOne(() => PerfilDocente, (perfil) => perfil.docente, { eager: true })
    perfil: PerfilDocente;
}
