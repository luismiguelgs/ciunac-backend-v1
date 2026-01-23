import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Estudiante } from "src/modules/principales/estudiantes/entities/estudiante.entity";
import { Grupo } from "src/modules/estructura/grupos/entities/grupo.entity";
import { Evaluacion } from "../../evaluaciones/entities/evaluacion.entity";

@Entity('notas')
export class Nota {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'estudiante_id' })
    estudianteId: string;

    @Column({ name: 'grupo_id' })
    grupoId: number;

    @Column({ name: 'evaluacion_id' })
    evaluacionId: number;

    @Column({ nullable: false })
    nota: number;

    @Column({ name: 'creado_en', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ name: 'modificado_en', default: () => 'CURRENT_TIMESTAMP' })
    modificadoEn: Date;

    //relaciones
    // Muchas notas pertenecen a un estudiante
    @ManyToOne(() => Estudiante)
    @JoinColumn({ name: 'estudiante_id' })
    estudiante: Estudiante;

    // Muchas notas pertenecen a un grupo
    @ManyToOne(() => Grupo)
    @JoinColumn({ name: 'grupo_id' })
    grupo: Grupo;

    // Muchas notas pertenecen a una evaluación
    @ManyToOne(() => Evaluacion)
    @JoinColumn({ name: 'evaluacion_id' })
    evaluacion: Evaluacion;
}
