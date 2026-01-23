import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Grupo } from 'src/modules/estructura/grupos/entities/grupo.entity';

@Entity('encuesta_respuestas')
export class EncuestaRespuesta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'grupo_id', type: 'int', nullable: false })
    grupoId: number;

    @Column({ name: 'promedio_ponderado', type: 'int', nullable: false })
    promedioPonderado: number;

    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'modificado_en' })
    modificadoEn: Date;

    // Relación
    @ManyToOne(() => Grupo)
    @JoinColumn({ name: 'grupo_id' })
    grupo: Grupo;
}

