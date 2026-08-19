import { Usuario } from 'src/modules/authentication/usuarios/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('password_reset_tokens')
@Index('UQ_password_reset_tokens_usuario_id', ['usuarioId'], { unique: true })
@Index('UQ_password_reset_tokens_token_hash', ['tokenHash'], { unique: true })
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_password_reset_tokens',
  })
  id: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @Column({ type: 'char', length: 64, name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', name: 'used_at', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'usuario_id',
    foreignKeyConstraintName: 'FK_password_reset_tokens_usuario',
  })
  usuario: Usuario;
}
