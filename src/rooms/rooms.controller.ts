import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Put,
    Param,
    Delete,
    Query,
} from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Controller("rooms")
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    @Post() // 방 생성하기
    create(@Body() createRoomDto: CreateRoomDto) {
        return this.roomsService.create(createRoomDto);
    }

    @Get() // 전체 방 목록 조회
    findAll() {
        return this.roomsService.findAll();
    }

    @Get("search")
    search(
        @Query("roomName") roomName: string,
        @Query("roomStatus") roomStatus: string,
        @Query("maxPeople") maxPeople: string,
        @Query("cutRating") cutRating: string,
    ) {
        // 데이터 입력에 주의를 해야함..
        // roomStatus, maxPeople, cutRating 초기값  0, roomName 비어있으면 비어서 전달
        return this.roomsService.search(
            roomName,
            +roomStatus,
            +maxPeople,
            +cutRating,
        );
    }

    @Get(":id") // 방 입장하기 === 단일 방 정보 조회
    findOne(@Param("id") id: string) {
        return this.roomsService.findOne(id);
    }

    @Put(":id") // 방 정보 수정하기
    update(@Param("id") id: string, @Body() updateRoomDto: UpdateRoomDto) {
        return this.roomsService.update(id, updateRoomDto);
    }

    @Delete(":id") // 방 삭제하기: 논리적 삭제
    remove(@Param("id") id: string) {
        return this.roomsService.remove(id);
    }
}
