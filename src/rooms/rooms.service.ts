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
    
    // async의 return 객체 수정 ("This action adds a new room", 수정 예정) 
    async create(createRoomDto: CreateRoomDto): Promise<string> {
        this.RoomsRepository.save(createRoomDto); // await 추가해야함, bug fix 브랜치 생성 후 작업 예정
        return "This action adds a new room"; // 반환 데이터는 roomId : roomId 형식이어야 함.
    }

    async findAll(): Promise<object> {
        const allRooms = await this.RoomsRepository.find();
        const rooms = allRooms.map(( {roomId, roomName, roomStatus, maxPeople, cutRating, createdAt }) => (
            { roomId, roomName, roomStatus, maxPeople, cutRating, createdAt }
        ))
        return { rooms : rooms };
    }

    async findOne(id: number): Promise<object> {
        const target = await this.RoomsRepository.findOneBy({roomId : id});
        const targetRoom = {roomId : target.roomId, 
                            roomName : target.roomName,
                            roomStatus : target.roomStatus,
                            maxPeople : target.maxPeople,
                            cutRating : target.cutRating,};

        return targetRoom;
    }

    update(id: number, updateRoomDto: UpdateRoomDto) {
        return `This action updates a #${id} room`;
    }

    remove(id: number) {
        return `This action removes a #${id} room`;
    }
}
