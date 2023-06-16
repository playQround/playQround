import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class Rooms {
    @PrimaryGeneratedColumn()
    roomId : number;

    @Column()
    key : string;
    
    @Column()
    roomName : string;
    
    @Column({
        default : 0
    })
    roomStatus : number;

    @Column()
    maxPeople : number;

    @Column()
    public : boolean;

    @Column()
    cutRating : number;

    @CreateDateColumn({
        nullable : true
    })
    createdAt: Date;

    @CreateDateColumn({
        nullable : true
    })
    updatedAt : Date;
}
