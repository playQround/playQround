import { WebSocketGateway, 
    WebSocketServer,
    SubscribeMessage } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'

@WebSocketGateway(3001, { cors: true })
export class webRtcGateway{
    @WebSocketServer() server: Server;

    // 1단계 - 입장 알림
    @SubscribeMessage("join")
    handleJoinMessage(client: Socket, roomId: any){
        client.join(roomId);
        client.broadcast.to(roomId).emit("enter", { userId: client.id });
    }

    // 2단계 - 연결 요청
    @SubscribeMessage("offer")
    handleOfferMessage(client: Socket, offer: any){
        client.broadcast.to("1234").emit("offer", { userId: client.id, offer });
    }

    // 3단계 - 응답 생성
    @SubscribeMessage("answer")
    handleAnswerMessage(client: Socket, {answer, offer, toUserId}){
        client.broadcast.to("1234").emit("answer", { 
            userId: client.id,
            answer, 
            responseOffer: offer,
            toUserId
        });
    }

    // 4단계 - 연결 후보 교환
    @SubscribeMessage("icecandidate")
    handleIcecandidateMessage(client: Socket, candidate: any){
        client.broadcast.to("1234").emit("icecandidate", { userId: client.id, candidate });
    }

    @SubscribeMessage("userDisconnect")
    handleDisconnect(client: Socket) {
        // 클라이언트의 연결 해제 이벤트 처리
        client.broadcast.to("1234").emit("userDisconnect", { userId: client.id });
    }
}