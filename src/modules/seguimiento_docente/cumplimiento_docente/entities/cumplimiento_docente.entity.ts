import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Modulo } from 'src/modules/estructura/modulos/entities/modulo.entity';
import { Docente } from 'src/modules/principales/docentes/entities/docente.entity';
import { AcademicoAdministrativo } from 'src/modules/seguimiento_docente/academico_administrativo/entities/academico_administrativo.entity';

@Entity('cumplimiento_docente')
export class CumplimientoDocente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'modulo_id' })
    moduloId: number;

    @Column({ name: 'docente_id', type: 'uuid' })
    docenteId: string;

    @Column({ name: 'academico_administrativo_id' })
    academicoAdministrativoId: number;

    @Column({ default: 0 })
    puntaje: number;

    @ManyToOne(() => Modulo)
    @JoinColumn({ name: 'modulo_id' })
    modulo: Modulo;

    @ManyToOne(() => Docente, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'docente_id' })
    docente: Docente;

    @ManyToOne(() => AcademicoAdministrativo)
    @JoinColumn({ name: 'academico_administrativo_id' })
    academicoAdministrativo: AcademicoAdministrativo;
}
