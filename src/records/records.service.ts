import { Injectable, NotFoundException } from "@nestjs/common";
// import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";

import { RecordsRepository } from "./records.repository";

@Injectable()
export class RecordsService {
    // 사용할 DB table 불러오기
    constructor(private readonly RecordsRepository: RecordsRepository) {}

    async update(UpdateRecordDto: UpdateRecordDto): Promise<object> {
        return await this.RecordsRepository.update(UpdateRecordDto);
    }
}
