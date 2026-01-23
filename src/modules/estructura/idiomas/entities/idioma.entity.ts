import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('idiomas')
export class Idioma {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    nombre: string;
}
