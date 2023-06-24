import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { RoomsRepository } from "./rooms.repository";
import { QuizzesRepository } from "src/quizzes/quizzes.repository";
import { InjectModel } from "@nestjs/mongoose";
import { Room } from "./schemas/room.schema";

@Injectable()
export class RoomsService {
    // 사용할 DB table 불러오기

    constructor(
        private readonly roomRepository: RoomsRepository,
        private readonly quizzesRepository: QuizzesRepository,
    ) {}

    async create(createRoomDto: CreateRoomDto): Promise<object> {
        return await this.roomRepository.create(createRoomDto);
    }

    async findAll(): Promise<object> {
        return await this.roomRepository.findAll();
    }

    async search(
        roomName: string,
        roomStatus: number,
        maxPeople: number,
        cutRating: number,
    ): Promise<object> {
        return await this.roomRepository.search(
            roomName,
            roomStatus,
            maxPeople,
            cutRating,
        );
    }

    async start(id: string, quizCount: number): Promise<any> {
        return await this.quizzesRepository.start(quizCount);
        // return await this.roomRepository.start(id, quizCount);
    }

    async findOne(id: string): Promise<object> {
        return await this.roomRepository.findOne(id);
    }

    async update(id: string, updateRoomDto: UpdateRoomDto): Promise<object> {
        return await this.roomRepository.update(id, updateRoomDto);
    }

    async remove(id: string): Promise<object> {
        return await this.roomRepository.remove(id);
    }
}
