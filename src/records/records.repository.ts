import { Injectable, NotFoundException } from "@nestjs/common";
// import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Record } from "./schema/records.schema";
import { Model } from "mongoose";

@Injectable()
export class RecordsRepository {
    constructor(
        @InjectModel(Record.name)
        private RecordModel: Model<Record>,
    ) {}

    async update(UpdateRecordDto: UpdateRecordDto): Promise<object> {
        const newRecord = new this.RecordModel(UpdateRecordDto);
        return await newRecord.save();
    }

    // async update(UpdateRecordDto: UpdateRecordDto): Promise<object> {
    //     return await this.RecordModel.updateOne(
    //         { userId: UpdateRecordDto.userId },
    //         { userScore: UpdateRecordDto.userScore },
    //     );
    // }
}
