
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Ciclo } from '../../ciclos/entities/ciclo.entity';
import { Docente } from 'src/modules/principales/docentes/entities/docente.entity';
import { Modulo } from 'src/modules/estructura/modulos/entities/modulo.entity';
import { Aula } from 'src/modules/estructura/aulas/entities/aula.entity';

@Entity('grupos')
export class Grupo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    codigo: string;

    @Column({ name: 'modulos_id' })
    moduloId: number;

    @Column({ name: 'ciclo_id' })
    cicloId: number;

    @ManyToOne(() => Ciclo)
    @JoinColumn({ name: 'ciclo_id' })
    ciclo: Ciclo;

    @Column({ name: 'docente_id' })
    docenteId: string;


    @Column({ name: 'aula_id' })
    aulaId: number;

    //Seguimiento
    @CreateDateColumn({ name: 'creado_en' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'modificado_en' })
    modificadoEn: Date;

    // Relaciones
    @ManyToOne(() => Modulo, (modulo) => modulo.grupos, { eager: true })
    @JoinColumn({ name: 'modulos_id' })
    modulo: Modulo;

    @ManyToOne(() => Aula)
    @JoinColumn({ name: 'aula_id' })
    aula: Aula;

    @ManyToOne(() => Docente)
    @JoinColumn({ name: 'docente_id' })
    docente: Docente;

}
