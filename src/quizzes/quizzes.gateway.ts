import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { QuizzesService } from "./quizzes.service";
import { RecordsService } from "../records/records.service";
import { RoomsService } from "src/rooms/rooms.service";
import { Logger } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";
import { InjectQueue } from "@nestjs/bull";
import { Queue, Job } from "bull";
require("dotenv").config();

@WebSocketGateway({
    cors: {
        origin: [
            "https://play-qround-fe.vercel.app",
            "https://admin.socket.io",
            "http://localhost:4000",
            "http://localhost:3001",
            "https://www.playqround.site",
        ],
        credentials: true,
    },
})
@Processor("MessageQueue")
export class QuizzesGateway {
    private readonly logger = new Logger(QuizzesGateway.name);
    constructor(
        // Quizzes Service DI
        private readonly quizzesService: QuizzesService,
        // Records Service DI
        private readonly recordsService: RecordsService,
        // Rooms Service DI
        private readonly roomsService: RoomsService,
        // ChatQueue DI
        @InjectQueue("MessageQueue") private chatQueue: Queue,
    ) {}

    @WebSocketServer() server: Server;
    public handleConnection(client: Socket) {
        //이미 접속된 room에서 나간다? 이게 맞나? 안하면 뒤에 join 작동안함
        client.leave(client.id);
        // 소켓 접속 로그
        this.logger.verbose(`Client connected: ${client.id}`);
        //소켓에 연결된 숫자를 로그에 기록
        this.logger.verbose(
            `Client connected: ${this.server.engine.clientsCount}`,
        );
    }

    //소켓에 접속이 끊겼을때 실행
    async handleDisconnect(client: Socket) {
        // 소켓 접속 끊김 로그
        this.logger.verbose(`Client disconnected: ${client.id}`);
        //소켓에 연결된 숫자를 로그에 기록
        this.logger.verbose(
            `Client connected: ${this.server.engine.clientsCount}`,
        );
    }

    // 방에 접속한 클라이언트 아이디를 조회 후 반환
    private getClientIdsInRoom(room: string): string[] {
        const clientsInRoom = this.server.sockets.adapter.rooms.get(room);
        return clientsInRoom ? Array.from(clientsInRoom) : [];
    }

    // 방에 접속했던 클라이언트 아이디를 모두 조회 후,
    // 현재 접속한 클라이언트 아이디만 남기고 반환
    private async currentParticipant(room: string): Promise<object> {
        // 방에 접속한 클라이언트 아이디를 조회하고,
        const currentClientId = this.getClientIdsInRoom(room);
        // 한번이라도 방에 입장했던 client 목록을 조회
        const roomRecord = await this.recordsService.getRoomRecord(room);
        // 현재 접속한 client id 값으로 필터링
        const currentParticipant = roomRecord.filter((item) =>
            currentClientId.includes(item?.socketId),
        );
        // 방 참여자 목록을 return
        return currentParticipant;
    }

    //TODO 여기에 접속한 유저의 숫자를 카운트해야하나
    //방에 입장했을 때 실행되는 서브스크립션
    @SubscribeMessage("joinRoom")
    async joinRoom(client: Socket, data: any) {
        // 방에 조인한 socket Id 값으로 재입장 구분
        const usersInThisRoom = this.getClientIdsInRoom(data?.room);
        if (usersInThisRoom.includes(client.id)) {
            this.logger.verbose(
                `${data.nickname} re-entered the room ${data.room}`,
            );
            client
                .to(data.room)
                .emit("notice", `${data.nickname} 님이 재입장하셨습니다.`);
        } else {
            // room에 입장
            client.join(data.room);
            // 방 입장 로그
            this.logger.verbose(
                `${data.nickname} entered the room ${data.room}`,
            );
            //room에 입장했다는 메세지를 프론트앤드로 보낸다.
            client
                .to(data.room)
                .emit("notice", `${data.nickname} 님이 입장하셨습니다.`);
            // 참여자를 Record document에 저장
            const UpdateRecordDto = {
                userId: data.userId,
                socketId: client.id,
                roomId: data.room,
                userName: data.nickname,
                userScore: 0,
                nowCorrect: 0,
                maxCombo: 0,
            };
            // 사용자 정보를 저장
            await this.recordsService.update(UpdateRecordDto);

            //client.to(data.room).emit("participant", `${data.nickname}`);
            this.logger.verbose(
                `Number of users in room: ${usersInThisRoom.length}`,
            );
        }
        // 한번이라도 방에 입장했던 client 목록을 조회
        const currentParticipant = await this.currentParticipant(data.room);

        // 방 참여자 목록을 클라이언트에 emit
        client
            .to(data.room)
            .emit("participant", JSON.stringify(currentParticipant));
        // 방 정보 업데이트를 위한 emit
        client.broadcast.emit("refreshRoom");
        await this.roomsService.update(data.room, {
            nowPeople: usersInThisRoom.length + 1,
        });

        return;
    }

    @SubscribeMessage("leaveRoom")
    async leaveRoom(client: Socket, data: any) {
        client.leave(data?.room);
        client
            .to(data.room)
            .emit("notice", `${data?.userName} 님이 퇴장하셨습니다.`);
        this.logger.verbose(`${data?.userName} left the room ${data?.room}`);
        const roomUserCount = this.getClientIdsInRoom(data?.room).length;
        this.logger.verbose(`Number of users in room: ${roomUserCount}`);

        // 한번이라도 방에 입장했던 client 목록을 조회
        const currentParticipant = await this.currentParticipant(data.room);
        // 방 참여자 목록을 클라이언트에 emit
        client
            .to(data.room)
            .emit("participant", JSON.stringify(currentParticipant));
        // 방 정보 업데이트를 위한 emit
        client.broadcast.emit("refreshRoom");
        return this.roomsService.update(data.room, {
            nowPeople: roomUserCount,
        });
    }

    // 게임 전/후 메시지 처리
    @SubscribeMessage("messageOutGame")
    async handleMessageOutGame(client: Socket, data: any) {
        //정답이 아니므로 채팅 내용만 프론트로 보낸다
        this.logger.verbose(
            `Out Game Message:${data.nickname} : ${data.message}`,
        );
        if (data?.message) {
            client
                .to(data.room)
                .emit("message", `${data.nickname} : ${data.message}`);
        }
    }

    //프론트 앤드 인게임 메시지에 응답하기위한 서브스크립션
    @SubscribeMessage("messageInGame")
    async handleMessage(client: Socket, data: any) {
        // 인게임 메시지 로깅
        this.logger.verbose(
            `In Game Message:${data.nickname} : ${data.message}`,
        );
        // 불 큐에 메시지 저장
        this.chatQueue.add(
            // 큐에 저장
            "MessageQueue",
            { data, clientId: client.id },
            { removeOnComplete: true }, // 작업 저장 성공 시 작업 데이터 삭제
        );
        return;
    }

    // 퀴즈 시작 이벤트
    @SubscribeMessage("startQuiz")
    async startQuiz(client: Socket, data: any) {
        const newQuiz = await this.quizzesService.getQuiz();
        // 퀴즈 시작 메시지(notice)
        client
            .to(data.room)
            .emit("notice", `${data.nickname}님이 퀴즈를 시작하셨습니다.`);
        // 퀴즈 시작 메시지 emit
        client.to(data.room).emit("startQuiz");
        // 퀴즈 시작으로 방 상태 변경
        this.roomsService.start(data.room);

        // 방 정보 업데이트를 위한 emit
        this.server.emit("refreshRoom", "");

        this.logger.verbose(`User ${data?.nickname} starts the quiz`);
        //방정보에 현재 퀴즈 답을 업데이트
        this.quizzesService.updateRoomAnswer(
            data.room,
            newQuiz.answer,
            data.remainingQuizzes,
        );
        // 게임 시작을 준비할 시간 FE로 보내기
        client.to(data.room).emit("readyTime", process.env.READY_QUIZ_TIME);
        // 첫번째 퀴즈 전달
        client.to(data.room).emit("quiz", newQuiz);
        // 남은 퀴즈 개수를 클라이언트로 보내기
        client
            .to(data.room)
            .emit("remainingQuizzesNum", data.remainingQuizzes - 1);
        // 카운트 다운 할 초 FE에 전달(= 한문제당 풀이 시간 - 게임 시작 준비 시간)
        client.to(data.room).emit("quizTime", process.env.START_QUIZ_TIME);
        return;
    }

    @Process("MessageQueue")
    async handleChatMessage(job: Job<any>) {
        this.logger.verbose(`Processing job ${job.id} of type ${job.name}`);
        const data = job.data.data;
        //Server 형식 타입을 Socket타입으로 바꾸기
        const client = this.server;

        const answerCheck = await this.quizzesService.checkAnswer(
            data.message,
            data.room,
            data.remainingQuizzes,
        );
        console.log("answerCheck", answerCheck);

        //아무입력값도 없다면 무시한다.
        if (data.message === "") {
            return;
        }

        //치트키
        if (data.message === "!answer") {
            // 치트키 로그
            this.logger.verbose(`User ${data?.nickname} used used cheat code`);
            const cheatKey = await this.quizzesService.getAnswer(
                data.room,
                data.remainingQuizzes,
            );
            client.to(data.room).emit("notice", `정답은 ${cheatKey}`);
            return;
        }

        this.logger.verbose(`${data.nickname} : ${data.message}`);
        //채팅 내용을 프론트 앤드로 보낸다
        client
            .to(data.room)
            .emit("message", `${data.nickname} : ${data.message}`);

        if (answerCheck) {
            //콤보 체크를 한다.
            const comboCheck = await this.quizzesService.updateCombo(
                data.room,
                data.userId,
            );
            //정답이므로 정답 축하 메세지를 보낸다.
            const getPoint =
                comboCheck.combo > 1
                    ? `+${data.point}점 | ${comboCheck.comboMention} 점`
                    : `+${data.point}점`;
            client
                .to(data.room)
                .emit(
                    "notice",
                    `${data.nickname}님이 정답을 맞추셨습니다. (${getPoint})`,
                );
            //정답자가 나왔으므로 중간결과를 저장한다.
            const UpdateRecordDto = {
                userId: data.userId, //유저의 아이디를 가져와야한다.
                socketId: job.data.clientId,
                roomId: data.room, //생성될때의 방 값을 가져와야한다.
                userName: data.nickname, //유저의 이름을 가져와야한다.
                userScore: data.point + comboCheck.comboPoint, //점수 기입방식의 논의가 필요하다.
                nowCorrect: 1, //정답을 맞춘 횟수를 기입한다.
                //comboCheck.lastAnswerUserId와 data.userId가 같으면 comboCheck.combo를 기입한다.
                maxCombo:
                    comboCheck.lastAnswerUserId === data.userId
                        ? comboCheck.combo
                        : 1,
            };
            //퀴즈 중간 결과 값을 업데이트한다.
            await this.recordsService.update(UpdateRecordDto);

            // 한번이라도 방에 입장했던 참가자 목록을 조회
            const currentParticipant = await this.currentParticipant(data.room);
            // 방 참여자 목록을 클라이언트에 emit
            client
                .to(data.room)
                .emit("participant", JSON.stringify(currentParticipant));

            //
            if (data.remainingQuizzes) {
                // 퀴즈 조회
                const newQuiz = await this.quizzesService.getQuiz();
                //방정보에 현재 퀴즈 답을 업데이트 한다.
                this.quizzesService.updateRoomAnswer(
                    data.room,
                    newQuiz.answer,
                    data.remainingQuizzes,
                );
                //퀴즈를 프론트앤드로 보낸다.
                client.to(data.room).emit("quiz", newQuiz);
                // 남은 퀴즈 개수를 클라이언트로 보내기
                client
                    .to(data.room)
                    .emit("remainingQuizzesNum", data.remainingQuizzes - 1);
                // 문제 풀이 제한 시간을 FE로 보내기
                client
                    .to(data.room)
                    .emit("quizTime", process.env.QUIZ_SOLVE_TIME);
            } else {
                // 남은 퀴즈가 없는 경우 notice로 퀴즈 종료 안내
                client.to(data.room).emit("notice", "모든 퀴즈를 풀었습니다.");
                client.to(data.room).emit("end", "게임종료");
                // 방 상태 업데이트
                this.roomsService.end(data.room);
                // 방 정보 업데이트를 위한 emit
                client.emit("refreshRoom");
            }
        }
    }
    @SubscribeMessage("refreshRoom")
    async handleRefreshRoom(client: Socket) {
        client.broadcast.emit("refreshRoom", "refreshRoom");
    }
}
