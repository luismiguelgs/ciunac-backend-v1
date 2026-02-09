import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Modulo } from '../../../estructura/modulos/entities/modulo.entity';
import { PerfilDocente } from '../../perfil_docente/entities/perfil_docente.entity';
import { Docente } from '../../../principales/docentes/entities/docente.entity';

@Entity('perfil_docente_resultados')
export class PerfilDocenteResultado {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'perfil_docente_id', type: 'uuid' })
    perfilDocenteId: string;

    @Column({ name: 'modulo_id', type: 'int' })
    moduloId: number;

    @Column({ name: 'docente_id', type: 'uuid' })
    docenteId: string;

    @Column({ name: 'resultado_final', type: 'decimal', precision: 5, scale: 2 })
    resultadoFinal: number;

    //Trazabilidad
    @CreateDateColumn({ name: 'creado_en', type: 'timestamp' })
    creadoEn: Date;

    @UpdateDateColumn({ name: 'modificado_en', type: 'timestamp' })
    modificadoEn: Date;

    //Relaciones
    @ManyToOne(() => PerfilDocente)
    @JoinColumn({ name: 'perfil_docente_id' })
    perfilDocente: PerfilDocente;

    @ManyToOne(() => Modulo)
    @JoinColumn({ name: 'modulo_id' })
    modulo: Modulo;

    @ManyToOne(() => Docente)
    @JoinColumn({ name: 'docente_id' })
    docente: Docente;
}
