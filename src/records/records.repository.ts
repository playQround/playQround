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
        const findRecord = await this.RecordModel.findOne({
            userId: UpdateRecordDto.userId,
            roomId: UpdateRecordDto.roomId,
        });
        console.log("repo", findRecord);
        if (!findRecord) {
            // throw new NotFoundException(
            //     `Record with ID ${UpdateRecordDto.userId} not found`,

            // );
            const newRecord = new this.RecordModel(UpdateRecordDto);
            await newRecord.save();
            return newRecord;
        } else {
            console.log("repo_findone", findRecord);
            //검색된 결과의 점수를 업데이트한다.
            findRecord.userScore += 1;
            await findRecord.save();
            return findRecord;
        }
        return await this.RecordModel.findOne({
            userId: UpdateRecordDto.userId,
        });
    }

    // async update(UpdateRecordDto: UpdateRecordDto): Promise<object> {
    //     return await this.RecordModel.updateOne(
    //         { userId: UpdateRecordDto.userId },
    //         { userScore: UpdateRecordDto.userScore },
    //     );
    // }
}
