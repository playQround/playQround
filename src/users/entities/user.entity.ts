import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ValueTransformer,
} from "typeorm";
import { kctTransformer } from "../transformers/kct.transformer";

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ unique: true })
    userEmail: string;

    @Column({ unique: true })
    userName: string;

    @Column()
    userPassword: string;

    @Column({ default: 0 })
    userRating: number;

    @Column({ default: false })
    active: boolean;

    @Column()
    verifyToken: string;

    //여태 맞춘 총 문제의 개수
    @Column({ default: 0 })
    totalCorrect: number;

    //한판에 달성한 최고 콤보수
    @Column({ default: 0 })
    maxCombo: number;

    //1등 달성 횟수
    @Column({ default: 0 })
    firstPlace: number;

    @CreateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        transformer: new kctTransformer(),
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP(6)",
        transformer: new kctTransformer(),
    })
    updatedAt: Date;
}
