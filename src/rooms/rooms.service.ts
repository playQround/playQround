import { Injectable } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { Rooms } from "./entities/room.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class RoomsService {
    // 사용할 DB table 불러오기
    constructor (
        @InjectRepository(Rooms)
        private RoomsRepository : Repository<Rooms>
    ) {}
    
    // async의 return 객체는 Promise 의 string ("This action adds a new room", 수정 예정) 
    async create(createRoomDto: CreateRoomDto): Promise<string> {
        this.RoomsRepository.save(createRoomDto);
        return "This action adds a new room";
    }

    findAll() {
        return `This action returns all rooms`;
    }

    findOne(id: number) {
        return `This action returns a #${id} room`;
    }

    update(id: number, updateRoomDto: UpdateRoomDto) {
        return `This action updates a #${id} room`;
    }

    remove(id: number) {
        return `This action removes a #${id} room`;
    }
}
