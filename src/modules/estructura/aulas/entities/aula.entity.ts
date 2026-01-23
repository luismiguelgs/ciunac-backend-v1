import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('aulas')
export class Aula {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    capacidad?: number;

    @Column({nullable: false})
    nombre: string;

    @Column({nullable: false})
    tipo: string; //VIRTUAL , FISICA

    @Column({nullable: true})
    ubicacion: string;

}
