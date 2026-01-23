import { Modulo } from "src/modules/estructura/modulos/entities/modulo.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('evaluaciones')
export class Evaluacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
    porcentaje: number;

    @Column({ name: 'periodo_id', nullable: false })
    periodoId: number;

    @Column({ default: true })
    activo: boolean;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'modificado_en' })
    modificadoEn: Date;

    //Relaciones
    @ManyToOne(() => Modulo)
    @JoinColumn({ name: 'periodo_id' })
    modulo: Modulo;
}
