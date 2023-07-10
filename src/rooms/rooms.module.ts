import { Module, forwardRef } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { RoomsController } from "./rooms.controller";
import { Room, RoomSchema } from "./schemas/room.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { RoomsRepository } from "./rooms.repository";
import { QuizzesModule } from "../quizzes/quizzes.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
        QuizzesModule,
        forwardRef(() => QuizzesModule), // 모듈의 순환 참조 해결을 위해 forwardRef()함수 사용
    ], // entity 사용을 위해 등록 - Mongoose ver.
    controllers: [RoomsController],
    providers: [RoomsService, RoomsRepository],
    exports: [RoomsRepository],
})
export class RoomsModule {}
