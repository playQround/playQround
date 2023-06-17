import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Quizzes {
    @PrimaryColumn()
    quizid: number;

    @Column()
    question: string;

    @Column()
    answer: string;
}
