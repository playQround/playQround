import { Module } from "@nestjs/common";
import { webRtcGateway } from "./webrtc.gateway";

@Module({
    imports: [],
    providers:[webRtcGateway]
})

export class webrtcMoudle{}