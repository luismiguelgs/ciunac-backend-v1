import { Aula } from "src/modules/estructura/aulas/entities/aula.entity";
import { Docente } from "src/modules/principales/docentes/entities/docente.entity";
import { Estado } from "src/modules/auxiliares/estados/entities/estado.entity";
import { Idioma } from "src/modules/estructura/idiomas/entities/idioma.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('examenes_ubicacion')
export class Examenesubicacion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, type: 'varchar', nullable: false })
    codigo: string;

    @Column({ nullable: false })
    fecha: Date;

    @Column({ name: 'estado_id', nullable: false })
    estadoId: number

    @Column({ name: 'idioma_id', nullable: false })
    idiomaId: number;

    @Column({ name: 'docente_id', nullable: false })
    docenteId: string;

    @Column({ name: 'aula_id', nullable: false })
    aulaId: number;

    @Column({ name: 'creado_en', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ name: 'modificado_en', default: () => 'CURRENT_TIMESTAMP' })
    modificadoEn: Date;

    //Relaciones
    @ManyToOne(() => Estado)
    @JoinColumn({ name: 'estado_id' })
    estado: Estado;

    @ManyToOne(() => Idioma)
    @JoinColumn({ name: 'idioma_id' })
    idioma: Idioma;

    @ManyToOne(() => Docente)
    @JoinColumn({ name: 'docente_id' })
    docente: Docente;

    @ManyToOne(() => Aula)
    @JoinColumn({ name: 'aula_id' })
    aula: Aula;
}
