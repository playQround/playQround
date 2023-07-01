import { Injectable, NotFoundException } from "@nestjs/common";
// import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";

import { RecordsRepository } from "./records.repository";
import { json } from "stream/consumers";

@Injectable()
export class RecordsService {
    // 사용할 DB table 불러오기
    constructor(private readonly RecordsRepository: RecordsRepository) {}

    async update(UpdateRecordDto: UpdateRecordDto): Promise<object> {
        return await this.RecordsRepository.update(UpdateRecordDto);
    }

    async getRoomRecord(roomId: number): Promise<string> {
        const record = await this.RecordsRepository.getRoomRecord(roomId);

        // object 형식의 record 를 json 형식으로 변환
        const jsonRecord = JSON.parse(JSON.stringify(record));
        // jsonRecord 를 userScore로 정렬하고 username과 userScore값만 가지는 배열로 변환
        const sortedRecord = jsonRecord
            .sort((a, b) => b.userScore - a.userScore)
            .map((record) => {
                return {
                    username: record.userName,
                    userScore: record.userScore,
                };
            });
        //sortedRecord를 string으로 변환
        const stringRecord = JSON.stringify(sortedRecord);

        return stringRecord;
    }
}
