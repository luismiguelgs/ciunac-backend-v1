import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pagos_banco')
export class PagosBanco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dni_codigo', length: 20, nullable: true })
  dniCodigo: string;

  @Column({ name: 'numero_voucher', nullable: true })
  numeroVoucher: string;

  @Column({ nullable: true })
  alumno: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monto: number;

  @Column({ name: 'fecha_pago', type: 'date', nullable: true })
  fechaPago: Date;

  @Column({ name: 'fecha_efectiva', type: 'date', nullable: true })
  fechaEfectiva: Date;

  @Column({ type: 'varchar', length: 7, nullable: true })
  periodo: string | null;

  @Column({ name: 'voucher_restante', nullable: true })
  voucherRestante: string;

  @Column({ nullable: true })
  archivo: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  verificado: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'modificado_en' })
  modificadoEn: Date;
}
