import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Rooms {
    @PrimaryGeneratedColumn()
    roomId : number;
    key : string;
    roomName : string;
    roomStatus : number;
    maxPeople : number;
    nowPeople : number;
    public : boolean;
    cutRationg : number;
    createdAt: Date;
    updatedAt : Date;
}
