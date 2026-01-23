import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tipos_documento_perfil')
export class TipoDocumentoPerfil {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: false })
    nombre: string;

    @Column({ type: 'int', nullable: false, default: 0 })
    puntaje: number;
}
