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
    //default 0 nowCorrect 값은 정답을 맞춘 횟수를 의미한다.
    @Prop({ default: 0 })
    nowCorrect: number;
    //default 0 maxCombo 값은 현재 게임에서 최고 콤보 숫자를 의미한다.
    @Prop({ default: 0 })
    maxCombo: number;
}

export const RecordSchema = SchemaFactory.createForClass(Record);
