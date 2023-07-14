import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { PrimaryGeneratedColumn } from "typeorm";

export type RoomDocument = HydratedDocument<Room>;

@Schema()
export class Room {
    @Prop()
    roomName: string;

    @Prop({ default: 0 })
    roomStatus: number;

    @Prop({ default: 1 })
    nowPeople: number;

    @Prop()
    maxPeople: number;

    @Prop()
    public: boolean;

    @Prop()
    cutRating: number;

    @Prop()
    nowAnswer: string;

    @Prop({ default: null })
    lastAnswerUserId: number;

    @Prop({ default: 1 })
    combo: number;

    @Prop({ default: new Date() })
    createdAt: Date;

    @Prop({ default: new Date() })
    updatedAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
