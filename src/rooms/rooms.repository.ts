import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Room } from "./schemas/room.schema";
import { Model } from "mongoose";

@Injectable()
export class RoomsRepository {
    constructor(
        @InjectModel(Room.name)
        private RoomModel: Model<Room>,
    ) {}

    async create(createRoomDto: CreateRoomDto): Promise<object> {
        const newRoom = new this.RoomModel(createRoomDto);
        newRoom.save();

        let idValue = newRoom._id;
        let roomId = idValue.toHexString();

        return { roomId }; // 반환 데이터는 roomId : roomId 형식이어야 함.
    }

    async findAll(): Promise<object> {
        const allRooms = await this.RoomModel.find().exec();
        const rooms = allRooms.map(
            ({
                _id,
                roomName,
                roomStatus,
                maxPeople,
                cutRating,
                createdAt,
            }) => ({
                _id,
                roomName,
                roomStatus,
                maxPeople,
                cutRating,
                createdAt,
            }),
        );

        return { rooms: rooms };
    }

    async search(
        roomName: string,
        roomStatus: number,
        maxPeople: number,
        cutRating: number,
    ): Promise<object> {
        const roomList = await this.RoomModel.find({
            roomName: { $regex: roomName },
            roomStatus: roomStatus,
            maxPeople: { $gte: maxPeople },
            cutRating: { $gte: cutRating },
        });

        return { rooms: roomList };
    }

    async findOne(id: string): Promise<object> {
        // notfounderror 추가 필요
        const target = await this.RoomModel.findOne({ _id: id }).exec();
        const targetRoom = {
            roomId: target._id,
            roomName: target.roomName,
            roomStatus: target.roomStatus,
            maxPeople: target.maxPeople,
            cutRating: target.cutRating,
        };

        return targetRoom;
    }

    async update(id: string, updateRoomDto: UpdateRoomDto): Promise<object> {
        const targetRoom = await this.RoomModel.findOne({ _id: id });
        // notfounderror message 협의 필요
        if (!targetRoom) {
            throw new NotFoundException(`${id}`);
        }

        const updatedRoom = Object.assign(targetRoom, updateRoomDto);
        await updatedRoom.save();

        return { message: "updated" };
    }

    async remove(id: string): Promise<object> {
        const targetRoom = await this.RoomModel.findOne({ _id: id });

        // notfounderror message 협의 필요
        if (!targetRoom) {
            throw new NotFoundException(`${id}`);
        }

        targetRoom.roomStatus = 4; // 논리적 삭제 : roomStatus 값을 4로 변경.
        targetRoom.save();
        return { message: "deleted" };
    }
}