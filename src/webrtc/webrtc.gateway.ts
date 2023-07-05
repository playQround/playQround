import { WebSocketGateway, 
    WebSocketServer,
    SubscribeMessage,
    MessageBody } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'

@WebSocketGateway()
export class webRtcGateway{
    @WebSocketServer() server: Server;

    @SubscribeMessage("join")
    handleJoinMessage(client: Socket, roomId: any){
        client.join(roomId);
        client.broadcast.to(roomId).emit("enter", "someone enter");
    }

    @SubscribeMessage("offer")
    handleOfferMessage(client: Socket, offer: any){
        client.broadcast.to("1234").emit("offer", offer);
    }

    @SubscribeMessage("answer")
    handleAnswerMessage(client: Socket, answer: any){
        client.broadcast.to("1234").emit("answer", answer);
    }

    @SubscribeMessage("icecandidate")
    handleIcecandidateMessage(client: Socket, candidate: any){
        client.broadcast.to("1234").emit("icecandidate", candidate);
    }
}