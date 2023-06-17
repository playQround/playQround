import { PartialType } from "@nestjs/mapped-types";
import { CreateRoomDto } from "./create-room.dto";

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
    readonly maxPeople?: number;
    readonly cutRating?: number;
}
