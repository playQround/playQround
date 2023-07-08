import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RecordDocument = HydratedDocument<Record>;

@Schema()
export class Record {
    @Prop()
    userId: number;
    @Prop()
    socketId: string;
    @Prop()
    roomId: string;
    @Prop()
    userName: string;
    @Prop()
    userScore: number;
}

export const RecordSchema = SchemaFactory.createForClass(Record);
