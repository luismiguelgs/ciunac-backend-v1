import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Estudiante } from "src/modules/principales/estudiantes/entities/estudiante.entity";
import { Grupo } from "src/modules/estructura/grupos/entities/grupo.entity";

@Entity('notas_final')
export class Notasfinal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'estudiante_id', nullable: false })
    estudianteId: string;

    @Column({ name: 'grupo_id', nullable: false })
    grupoId: number;

    @Column({ nullable: false })
    nota: number;

    @Column({ nullable: false })
    aprobado: boolean;

    @Column({ name: 'creado_en', default: () => 'CURRENT_TIMESTAMP' })
    creadoEn: Date;

    @Column({ name: 'modificado_en', default: () => 'CURRENT_TIMESTAMP' })
    modificadoEn: Date;

    // Relaciones
    // Muchas notas finales pueden pertenecer a un estudiante
    @ManyToOne(() => Estudiante)
    @JoinColumn({ name: 'estudiante_id' })
    estudiante: Estudiante;

    // Muchas notas finales pueden pertenecer a un grupo
    @ManyToOne(() => Grupo)
    @JoinColumn({ name: 'grupo_id' })
    grupo: Grupo;
}
