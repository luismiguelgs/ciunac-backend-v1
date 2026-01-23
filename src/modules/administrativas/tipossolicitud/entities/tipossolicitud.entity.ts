import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tipos_solicitud')
export class Tipossolicitud {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    solicitud: string;

    @Column('numeric', { precision: 10, scale: 2, default: 0 })
    precio: number;
}
