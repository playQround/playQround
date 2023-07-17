import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateRecordDto } from "./dto/update-record.dto";
import { RecordsRepository } from "./records.repository";
import { GetRecordDto } from "./dto/get-record.dto";

@Injectable()
export class RecordsService {
    // 사용할 DB table 불러오기
    constructor(private readonly RecordsRepository: RecordsRepository) {}

    async update(UpdateRecordDto: UpdateRecordDto): Promise<object> {
        return await this.RecordsRepository.update(UpdateRecordDto);
    }

    async getRoomRecord(roomId: string): Promise<Array<GetRecordDto>> {
        const record = await this.RecordsRepository.getRoomRecord(roomId);

        // jsonRecord 를 userScore로 정렬하고 username과 userScore값만 가지는 배열로 변환
        const sortedRecord = record
            .sort((a, b) => b.userScore - a.userScore)
            .map((record) => {
                return {
                    userName: record.userName,
                    userId: record.userId,
                    userScore: record.userScore,
                    socketId: record.socketId,
                };
            });

        return sortedRecord;
    }
}
