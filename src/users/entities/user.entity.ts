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

    @Column({default: false})
    active: boolean;

    @Column()
    verifyToken: string;

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
