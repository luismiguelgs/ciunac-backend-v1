import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { RolUsuario } from "../../usuarios/entities/usuario.entity";

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column({ nullable: true })
  modulo: string;
}

@Entity('rol_permisos')
@Unique(['rol', 'permiso'])
export class RolPermiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RolUsuario,
  })
  rol: RolUsuario;

  @Column({ name: 'permiso_id' })
  permisoId: number;

  @Column({ nullable: true })
  descripcion: string;

  @ManyToOne(() => Permiso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permiso_id' })
  permiso: Permiso;
}
