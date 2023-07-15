import { Injectable, NotFoundException, Logger } from "@nestjs/common";
// import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Record } from "./schema/records.schema";
import { Model } from "mongoose";

@Injectable()
export class RecordsRepository {
    private readonly logger = new Logger(RecordsRepository.name);
    constructor(
        @InjectModel(Record.name)
        private RecordModel: Model<Record>,
    ) {}

    async update(UpdateRecordDto: UpdateRecordDto): Promise<object> {
        const findRecord = await this.RecordModel.findOne({
            // uuid 를 숫자로만 변경해서 userId 값으로 findOne 하는 것으로...
            roomId: UpdateRecordDto.roomId,
            socketId: UpdateRecordDto.socketId,
        });
        //console.log("repo", findRecord);
        if (!findRecord) {
            const newRecord = new this.RecordModel(UpdateRecordDto);
            await newRecord.save();
            return newRecord;
        } else {
            findRecord.userScore += UpdateRecordDto.userScore;
            findRecord.userName = UpdateRecordDto.userName
            await findRecord.save();
            this.logger.verbose(
                `Updating record for user: ${findRecord?.userId} in room: ${findRecord?.roomId}. New score: ${findRecord?.userScore}`,
            );
            return findRecord;
        }
    }

    async getRoomRecord(roomId: string): Promise<Array<UpdateRecordDto>> {
        const roomRecord = await this.RecordModel.find({ roomId: roomId });
        return roomRecord;
    }
}
