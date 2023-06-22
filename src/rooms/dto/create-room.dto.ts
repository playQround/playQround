import { LargeNumberLike } from "crypto";

export class CreateRoomDto {
    readonly roomName: string;
    readonly maxPeople: number;
    readonly public: boolean;
    readonly cutRating: number;
}
