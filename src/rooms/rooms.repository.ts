import { Inject, Injectable, NotFoundException, Logger } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Room } from "./schemas/room.schema";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Model } from "mongoose";
import { RecordsRepository } from "../records/records.repository";
import { UsersRepository } from "src/users/users.repository";

@Injectable()
export class RoomsRepository {
    private readonly logger = new Logger(RoomsRepository.name);
    constructor(
        @InjectModel(Room.name)
        private RoomModel: Model<Room>,
        private recordsRepository: RecordsRepository,
        private usersRepository: UsersRepository,
        @Inject(CACHE_MANAGER) private cacheManager: Cache, // 캐시를 사용하기 위해 추가
    ) {}

    async create(createRoomDto: CreateRoomDto): Promise<object> {
        const newRoom = new this.RoomModel(createRoomDto);
        newRoom.save();

        let idValue = newRoom._id;
        let roomId = idValue.toHexString();

        return { roomId }; // 반환 데이터는 roomId : roomId 형식이어야 함.
    }

    async findAll(): Promise<object> {
        const rooms = await this.RoomModel.find({
            $or: [
                { roomStatus: 0 },
                {
                    $and: [
                        { nowPeople: { $ne: 0 } },
                        { roomStatus: { $ne: 1 } },
                    ],
                },
            ],
        })
            .sort({ roomStatus: 1, createdAt: -1 })
            .exec();

        return { rooms: rooms };
    }

    async search(
        roomName: string,
        roomStatus: number,
        maxPeople: number,
        cutRating: number,
    ): Promise<object> {
        // 전체 조회일 때
        if (roomStatus === 3) {
            const roomList = await this.RoomModel.find({
                $or: [
                    { roomStatus: 0 },
                    {
                        $and: [
                            { nowPeople: { $ne: 0 } },
                            { roomStatus: { $ne: 1 } },
                        ],
                    },
                ],
                roomName: { $regex: roomName },
                maxPeople: { $gte: maxPeople },
                cutRating: { $gte: cutRating },
            });
            return { rooms: roomList };
        } else if (roomStatus === 0) {
            const roomList = await this.RoomModel.find({
                roomName: { $regex: roomName },
                roomStatus: roomStatus,
                maxPeople: { $gte: maxPeople },
                cutRating: { $gte: cutRating },
            });
            return { rooms: roomList };
        } else {
            const roomList = await this.RoomModel.find({
                roomName: { $regex: roomName },
                roomStatus: roomStatus,
                maxPeople: { $gte: maxPeople },
                cutRating: { $gte: cutRating },
                nowPeople: { $ne: 0 },
            });
            return { rooms: roomList };
        }
    }

    async findOne(id: string): Promise<object> {
        // not found error 추가 필요
        const target = await this.RoomModel.findOne({ _id: id }).exec();

        // 방이 없음 - 비정식 루트로 접속할 때 오류 반환
        if (!target) {
            throw new NotFoundException(`${id}`);
        }

        // 제한 인원 달성으로 방 입장이 불가능 - 403 에러로 추가 예정
        if (target.nowPeople === target.maxPeople) {
            return {
                message: "최대 수용 인원에 도달되어 입장이 불가능합니다.",
            };
        }

        const targetRoom = {
            roomId: target._id,
            roomName: target.roomName,
            roomStatus: target.roomStatus,
            nowPeople: target.nowPeople + 1,
            maxPeople: target.maxPeople,
            cutRating: target.cutRating,
            nowAnswer: target.nowAnswer,
        };

        await this.RoomModel.findByIdAndUpdate(id, targetRoom, { new: true });
        return targetRoom;
    }

    async findAnswer(id: string, numRemainingQuizzes: string): Promise<string> {
        try {
            const cachedAnswerPromise = this.cacheManager.get(
                id + numRemainingQuizzes,
            );
            // 타임아웃 설정
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error("Timeout occurred"));
                }, 100); // 0.1초 타임아웃
            });

            // Promise race
            const result = await Promise.race([
                cachedAnswerPromise,
                timeoutPromise,
            ]);
            if (result === "null") {
                throw new Error("Timeout occurred");
            } else if (typeof result === "string") {
                this.logger.verbose(
                    `room repository get answer from cache ${result}`,
                );
                return result;
            } else {
                throw new Error("Timeout occurred");
            }
        } catch (error) {
            this.logger.error(`room repository getAnswer get error ${error}`);
            const roomInfo = await this.RoomModel.findOne({ _id: id }).exec();
            return roomInfo["nowAnswer"];
        }
    }

    async leaveRoom(id: string): Promise<any> {
        const target = await this.RoomModel.findOne({ _id: id }).exec();

        if (!target) {
            throw new NotFoundException(`${id}`);
        }

        const targetRoom = {
            roomId: target._id,
            roomName: target.roomName,
            roomStatus: target.roomStatus,
            nowPeople: target.nowPeople - 1,
            maxPeople: target.maxPeople,
            cutRating: target.cutRating,
        };

        await this.RoomModel.findByIdAndUpdate(id, targetRoom, { new: true });
        return { message: "Leave Room Success" };
    }

    async update(id: string, updateRoomDto: UpdateRoomDto): Promise<object> {
        const targetRoom = await this.RoomModel.findOne({ _id: id });
        // not found error message 협의 필요
        if (!targetRoom) {
            throw new NotFoundException(`${id}`);
        }

        const updatedRoom = Object.assign(targetRoom, updateRoomDto);
        await updatedRoom.save();

        // log
        this.logger.verbose(`Updated room: ${JSON.stringify(updateRoomDto)}`);

        return { message: "updated" };
    }

    async remove(id: string): Promise<object> {
        const targetRoom = await this.RoomModel.findOne({ _id: id });

        // not found error message 협의 필요
        if (!targetRoom) {
            throw new NotFoundException(`${id}`);
        }

        targetRoom.roomStatus = 4; // 논리적 삭제 : roomStatus 값을 4로 변경.
        targetRoom.save();
        return { message: "deleted" };
    }

    async roomStatusUpdate(id: string, roomStatus: number): Promise<object> {
        const targetRoom = await this.RoomModel.findOne({ _id: id });

        //방을 찾는 다 못찾으면 뭔가 처리해줘야 할듯
        if (!targetRoom) {
            throw new NotFoundException(`${id}`);
        }

        targetRoom.roomStatus = roomStatus;

        // 방이 종료되는 경우
        if (roomStatus === 2) {
            const targetRoomRecords =
                await this.recordsRepository.getRoomRecord(id);
            for (let user of targetRoomRecords) {
                // 회원인 경우
                if (String(user.userId).length < String(Date.now()).length) {
                    await this.usersRepository.updateRecord(
                        user.userId,
                        user.userScore,
                        user.nowCorrect,
                        user.maxCombo,
                    );
                }
            }
        }

        targetRoom.save();
        return { message: "updated" };
    }

    async updateRoomAnswer(
        id: string,
        answer: string,
        numRemainingQuizzes: string,
    ): Promise<void> {
        try {
            const cacheSet = this.cacheManager.set(
                id + numRemainingQuizzes,
                answer,
                50000,
            );
            // 타임아웃 설정
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error("Timeout occurred"));
                }, 100); // 0.1초 타임아웃
            });
            // Promise race
            await Promise.race([cacheSet, timeoutPromise]);
        } catch (error) {
            this.logger.error(
                `error in update room answer to redis cache: ${error}`,
            );
        }
        const targetRoom = await this.RoomModel.findOne({ _id: id });
        targetRoom.nowAnswer = answer;
        targetRoom.save();
        this.logger.verbose(
            `room repository update room answer(${answer}) to mongo DB`,
        );
        return;
    }

    async updateCombo(roomId: number, userId: number) {
        //roomId로 방을 찾는다.
        const targetRoom = await this.RoomModel.findOne({ _id: roomId });
        // 방이 없다면 에러를 반환한다.
        if (!targetRoom) {
            throw new NotFoundException(`${roomId}`);
        }

        // 방이 있다면 현재 마지막 정답자(lastAnswerUserId)를 가져오며 값이 없으면 바로 입력한다
        if (targetRoom.lastAnswerUserId === null) {
            targetRoom.lastAnswerUserId = userId;
            targetRoom.combo = 1;
            targetRoom.save();
            // 현재 콤보와 마지막 정답자를 반환한다.
            return {
                combo: targetRoom.combo,
                lastAnswerUserId: targetRoom.lastAnswerUserId,
            };
        }
        // 마지막 정답자가 있다면 현재 정답자와 비교하여 같다면 콤보를 1 증가시키고 다르다면 1로 초기화한다.
        else {
            if (targetRoom.lastAnswerUserId === userId) {
                targetRoom.combo += 1;
            } else {
                targetRoom.combo = 1;
            }
            targetRoom.lastAnswerUserId = userId;
            targetRoom.save();
            // 현재 콤보와 마지막 정답자를 반환한다.
            return {
                combo: targetRoom.combo,
                lastAnswerUserId: targetRoom.lastAnswerUserId,
            };
        }
    }
}
