import { Module } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { RoomsController } from "./rooms.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Room, RoomSchema } from "./schemas/room.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { RoomsRepository } from "./rooms.repository";
import { QuizzesModule } from "src/quizzes/quizzes.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
        QuizzesModule,
    ], // entity 사용을 위해 등록 - Mongoose ver.
    controllers: [RoomsController],
    providers: [RoomsService, RoomsRepository],
})
export class RoomsModule {}
