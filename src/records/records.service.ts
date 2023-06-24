import { Injectable, NotFoundException, Logger } from "@nestjs/common";
// import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";

import { RecordsRepository } from "./records.repository";

@Injectable()
export class RecordsService {
    // Logger 사용
    private readonly logger = new Logger(RecordsService.name);
    // 사용할 DB table 불러오기
    constructor(private readonly RecordsRepository: RecordsRepository) {}

    async update(UpdateRecordDto: UpdateRecordDto): Promise<object> {
        this.logger.verbose(
            `Updating record for user: ${UpdateRecordDto?.userId} in room: ${UpdateRecordDto?.roomId}. New score: ${UpdateRecordDto?.userScore}`,
        );
        return await this.RecordsRepository.update(UpdateRecordDto);
    }
}
