import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { Rooms } from "./entities/room.entity";
import { Like, MoreThanOrEqual, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { NotFoundError } from "rxjs";

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
        // 논리적 삭제 진행된 방 === roomStauts 값이 4가 아닌 데이터들 제외 필요
        const allRooms = await this.RoomsRepository.find();
        const rooms = allRooms.map(( {roomId, roomName, roomStatus, maxPeople, cutRating, createdAt }) => (
            { roomId, roomName, roomStatus, maxPeople, cutRating, createdAt }
        ));

        return { rooms : rooms };
    }

    async search(roomName: string, roomStatus: number, maxPeople: number, cutRating: number): Promise<object> {
        const roomList = await this.RoomsRepository.findBy({
            roomName : Like("%" + roomName + "%"),
            roomStatus : roomStatus,
            maxPeople : MoreThanOrEqual(maxPeople),
            cutRating : MoreThanOrEqual(cutRating),
        });

        return { rooms : roomList };
    }

    async findOne(id: number): Promise<object> {
        // notfounderror 추가 필요
        const target = await this.RoomsRepository.findOneBy({roomId : id});
        const targetRoom = {roomId : target.roomId, 
                            roomName : target.roomName,
                            roomStatus : target.roomStatus,
                            maxPeople : target.maxPeople,
                            cutRating : target.cutRating,
                        };

        return targetRoom;
    }

    async update(id: number, updateRoomDto: UpdateRoomDto): Promise<object> {
        const targetRoom = await this.RoomsRepository.findOneBy({roomId : id});
        
        // notfounderror message 협의 필요
        if (!targetRoom) {
            throw new NotFoundException(`${id}`);
        }

        const updatedRoom = Object.assign(targetRoom, updateRoomDto);
        await this.RoomsRepository.save(updatedRoom);

        return { message : "updated"};
    }

    async remove(id: number): Promise<object> {
        const targetRoom = await this.RoomsRepository.findOneBy({roomId : id});
        
        // notfounderror message 협의 필요
        if (!targetRoom) {
            throw new NotFoundException(`${id}`);
        }

        targetRoom.roomStatus = 4; // 논리적 삭제 : roomStatus 값을 4로 변경.
        const deleteRoom = await this.RoomsRepository.save(targetRoom);

        return { message : "deleted"};
    }
}
