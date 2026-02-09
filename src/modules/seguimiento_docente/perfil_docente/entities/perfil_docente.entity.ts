import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Docente } from "src/modules/principales/docentes/entities/docente.entity";
import { Idioma } from "src/modules/estructura/idiomas/entities/idioma.entity";

export enum NivelIdioma {
    B2 = 'B2',
    C1 = 'C1',
    C2 = 'C2',
}

@Entity('perfil_docente')
export class PerfilDocente {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ name: 'docente_id', type: 'uuid', unique: true, nullable: false })
    docenteId: string;

    @Column({ name: 'experiencia_total', type: 'int', nullable: false })
    experienciaTotal: number;

    @Column({ name: 'idioma_id', type: 'int', nullable: false })
    idiomaId: number;

    @Column({
        name: 'nivel_idioma',
        type: 'enum',
        enum: NivelIdioma,
        nullable: true,
    })
    nivelIdioma: NivelIdioma;

    @Column({ name: 'puntaje_final', type: 'int', nullable: false })
    puntajeFinal: number;

    @Column({ name: 'creado_en', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ name: 'modificado_en', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    modificadoEn: Date;

    @OneToOne(() => Docente, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'docente_id' })
    docente: Docente;

    @ManyToOne(() => Idioma)
    @JoinColumn({ name: 'idioma_id' })
    idioma: Idioma;
}
