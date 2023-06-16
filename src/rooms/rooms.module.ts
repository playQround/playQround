import { Module } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { RoomsController } from "./rooms.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rooms } from "./entities/room.entity";

@Module({
    imports : [TypeOrmModule.forFeature([Rooms])], // entity 사용을 위해 등록
    controllers: [RoomsController],
    providers: [RoomsService],
})
export class RoomsModule {}
