import { Idioma } from "src/modules/estructura/idiomas/entities/idioma.entity";
import { Nivel } from "src/modules/estructura/niveles/entities/nivel.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('ciclos')
export class Ciclo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: false })
    nombre: string;

    @Column({ type: 'int', name: 'numero_ciclo' })
    numeroCiclo: number;

    // Columna explícita para FK Idioma
    @Column({ name: 'idioma_id' })
    idiomaId: number;

    // Columna explícita para FK Nivel
    @Column({ name: 'nivel_id' })
    nivelId: number;

    @Column({ type: 'varchar', nullable: false })
    codigo: string;

    // 🔗 Relación con Idiomas (muchos ciclos pertenecen a un idioma)
    @ManyToOne(() => Idioma)
    @JoinColumn({ name: 'idioma_id' })
    idioma: Idioma;

    // 🔗 Relación con Niveles (muchos ciclos pertenecen a un nivel)
    @ManyToOne(() => Nivel)
    @JoinColumn({ name: 'nivel_id' })
    nivel: Nivel;
}
