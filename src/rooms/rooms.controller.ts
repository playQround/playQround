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
    Logger,
} from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Controller("rooms")
export class RoomsController {
    // Logger 사용
    private readonly logger = new Logger(RoomsController.name);
    constructor(private readonly roomsService: RoomsService) {}

    // 방 생성하기
    @Post()
    create(@Body() createRoomDto: CreateRoomDto) {
        // 방 생성 로그(추후 useGuard 추가 시 user정보도 로그 추가 필요)
        this.logger.verbose(`Creating new room: ${createRoomDto?.roomName}`);
        return this.roomsService.create(createRoomDto);
    }

    // 전체 방 목록 조회
    @Get()
    findAll() {
        // 전체 방 목록 조회 로그(추후 useGuard 추가 시 user정보도 로그 추가 필요)
        this.logger.verbose(`Fetching all rooms.`);
        return this.roomsService.findAll();
    }

    @Get("search")
    search(
        @Query("roomName") roomName: string,
        @Query("roomStatus") roomStatus: string,
        @Query("maxPeople") maxPeople: string,
        @Query("cutRating") cutRating: string,
    ) {
        // 방 검색 로그(추후 useGuard 추가 시 user정보도 로그 추가 필요)
        this.logger.verbose(
            `Performing room search with parameters: roomName=${roomName}, roomStatus=${roomStatus}, maxPeople=${maxPeople}, cutRating=${cutRating}`,
        );
        // 데이터 입력에 주의를 해야함..
        // roomStatus, maxPeople, cutRating 초기값  0, roomName 비어있으면 비어서 전달
        return this.roomsService.search(
            roomName,
            +roomStatus,
            +maxPeople,
            +cutRating,
        );
    }

    // @Get(":id/start")
    // start(@Param("id") id: string, @Query("count") quizCount: string) {
    //     // 방의 시작 로그
    //     this.logger.verbose(
    //         `Starting room with ID: ${id}, quizCount: ${quizCount}`,
    //     );
    //     return this.roomsService.start(id, +quizCount);
    // }

    @Get(":id/end")
    end(@Param("id") id: string) {
        // 방의 종료 로그
        this.logger.verbose(`Ending room with ID: ${id}`);
        return this.roomsService.end(id);
    }

    @Get(":id") // 방 입장하기 === 단일 방 정보 조회
    findOne(@Param("id") id: string) {
        // 단일 방 정보 조회 로그(추후 useGuard 추가 시 user정보도 로그 추가 필요)
        this.logger.verbose(`Fetching room with ID: ${id}`);
        return this.roomsService.findOne(id);
    }

    @Get(":id/leave") // 방 퇴장하기 - 소켓 연결 끊어지는 경우 실행
    leaveRoom(@Param("id") id: string) {
        this.logger.verbose(`Leaving room with ID: ${id}`);
        return this.roomsService.leaveRoom(id);
    }

    @Put(":id") // 방 정보 수정하기
    update(@Param("id") id: string, @Body() updateRoomDto: UpdateRoomDto) {
        // 방 정보 수정 로그
        this.logger.verbose(
            `Updating room with ID: ${id} , Updated fields: maxPeople=${updateRoomDto?.maxPeople}, cutRating=${updateRoomDto?.cutRating}`,
        );
        return this.roomsService.update(id, updateRoomDto);
    }

    @Delete(":id") // 방 삭제하기: 논리적 삭제
    remove(@Param("id") id: string) {
        // 방 삭제 로그
        this.logger.verbose(`Removing room with ID: ${id}`);
        return this.roomsService.remove(id);
    }
}
