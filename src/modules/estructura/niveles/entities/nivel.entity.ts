import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('niveles')
export class Nivel {
	@PrimaryGeneratedColumn()
    id: number;

	@Column({ type: 'varchar', nullable: false })
	nombre: string;

    @Column({ type: 'int' })
    orden: number;
}
