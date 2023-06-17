import { LargeNumberLike } from "crypto";

export class CreateRoomDto {
    readonly key : string;
    readonly roomName : string;
    readonly roomStatus : number;
    readonly maxPeople : number;
    readonly public : boolean;
    readonly cutRating : number;
}
