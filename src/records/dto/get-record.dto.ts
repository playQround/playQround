import { PartialType } from "@nestjs/mapped-types";
import { UpdateRecordDto } from "./update-record.dto";

export class GetRecordDto extends PartialType(UpdateRecordDto) {
    socketId: string;

    userName: string;

    userScore: number;
}
