import { Modulo } from 'src/modules/estructura/modulos/entities/modulo.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from 'typeorm';

@Entity('cronograma_ubicacion')
export class Cronogramaubicacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'modulo_id', nullable: false })
    moduloId: number;

    @Column({ nullable: false })
    fecha: Date;

    @Column({ nullable: false, default: true })
    activo: boolean;

    @Column({ name: 'creado_en', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ name: 'modificado_en', default: () => 'CURRENT_TIMESTAMP' })
    modificadoEn: Date;

    //Relaciones
    @OneToOne(() => Modulo)
    @JoinColumn({ name: 'modulo_id' })
    modulo: Modulo;
}
