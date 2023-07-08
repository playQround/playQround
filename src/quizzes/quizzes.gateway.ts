import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { QuizzesService } from "./quizzes.service";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { RecordsService } from "../records/records.service";
import { Logger } from "@nestjs/common";
import { Process, Processor } from "@nestjs/bull";
import { InjectQueue } from "@nestjs/bull";
import { Queue, Job } from "bull";

@WebSocketGateway({ cors: true })
@Processor("MessageQueue")
export class QuizzesGateway {
    private readonly logger = new Logger(QuizzesGateway.name);
    constructor(
        private readonly quizzesService: QuizzesService,
        private readonly RecordsService: RecordsService,
        @InjectQueue("MessageQueue") private chatQueue: Queue,
    ) {}

    @WebSocketServer() server: Server;
    //소켓에 접속 되었을때 실행
    public handleConnection(client: Socket, ...args: any[]) {
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
    async handleDisconnect(client: Socket, ...args: any[]) {
        // 소켓 접속 끊김 로그
        this.logger.verbose(`Client disconnected: ${client.id}`);
        //소켓에 연결된 숫자를 로그에 기록
        this.logger.verbose(
            `Client connected: ${this.server.engine.clientsCount}`,
        );
    }

    // Method to get the list of client IDs in a room
    private getClientIdsInRoom(room: string): string[] {
        const clientsInRoom = this.server.sockets.adapter.rooms.get(room);
        return clientsInRoom ? Array.from(clientsInRoom) : [];
    }

    //TODO 여기에 접속한 유저의 숫자를 카운트해야하나
    //방에 입장했을 때 실행되는 서브스크립션
    @SubscribeMessage("joinRoom")
    async joinRoom(client: Socket, data: any) {
        const usersInThisRoom = this.getClientIdsInRoom(data?.room);
        if (usersInThisRoom.includes(client.id)) {
            this.logger.verbose(
                `${data?.nickname} re-entered the room ${data?.room}`,
            );
            client
                .to(data["room"])
                .emit("notice", `${data["nickname"]} 님이 재입장하셨습니다.`);
            return;
        }
        //join을 통해 소켓의 room에 입장한다.
        client.join(data["room"]);
        // 방 입장 로그
        this.logger.verbose(`${data?.nickname} entered the room ${data?.room}`);
        //room에 입장했다는 메세지를 프론트앤드로 보낸다.
        client
            .to(data["room"])
            .emit("notice", `${data["nickname"]} 님이 입장하셨습니다.`);

        //참여자목록을 Record document에 저장
        const UpdateRecordDto = {
            userId: data.userId
                ? data.userId
                : this.quizzesService.anonymousUserId(), //유저의 아이디를 가져와야한다.
            socketId: client.id,
            roomId: data.room, //생성될때의 방 값을 가져와야한다.
            userName: data.nickname, //유저의 이름을 가져와야한다.
            userScore: 0, //점수 기입방식의 논의가 필요하다.
        };
        // 사용자 정보를 입력
        await this.RecordsService.update(UpdateRecordDto);
        //client.to(data["room"]).emit("participant", `${data["nickname"]}`);
        this.logger.verbose(
            `Number of users in room: ${this.getClientIdsInRoom.length}`,
        );
        // 입력 후 전체 사용자 목록을 조회해서,
        const roomRecord = await this.RecordsService.getRoomRecord(
            data["room"],
        );

        console.log(roomRecord);
        client.to(data["room"]).emit("participant", roomRecord);

        return;
    }

    @SubscribeMessage("leaveRoom")
    async leaveRoom(client: Socket, data: any) {
        client.leave(data?.room);
        client
            .to(data["room"])
            .emit("notice", `${data?.userName} 님이 퇴장하셨습니다.`);
        this.logger.verbose(`${data?.userName} left the room ${data?.room}`);
        const roomUserCount = this.getClientIdsInRoom(data?.room).length;
        this.logger.verbose(`Number of users in room: ${roomUserCount}`);
    }

    //프론트 앤드 socket.emit("message", message, now_quiz_answer); 에 응답하기위한 서브스크립션
    @SubscribeMessage("message")
    async handleMessage(client: Socket, data: any) {
        this.logger.verbose(`User ${data?.nickname} sent a message`);
        //퀴즈의 정답을 체크한다. 정답이면 true 오답이면 false를 반환한다.
        this.chatQueue.add(
            // 큐에 저장
            "MessageQueue",
            { data, clientId: client.id },
            { removeOnComplete: true }, // 작업 저장 성공 시 작업 데이터 삭제
        );

        return;
    }

    @SubscribeMessage("startQuiz")
    async startQuiz(client: Socket, data: any) {
        //퀴즈 DB의 총 갯수를 구한다.
        const quizCount = await this.quizzesService.getQuizCount();

        //랜덤한 id값을 생성하고 그 id값의 퀴즈를 고른다.
        const randomNum = Math.floor(Math.random() * quizCount) + 1;
        const newQuiz = await this.quizzesService.startQuiz(randomNum);

        //console.log("quize", newQuiz);퀴즈 확인용 출력입니다 주석처리 합니다
        client
            .to(data["room"])
            .emit(
                "notice",
                `()()()()()()${data["nickname"]}님이 퀴즈를 시작하셨습니다.()()()()()()()`,
            );
        client.to(data["room"]).emit("startQuiz");
        this.logger.verbose(`User ${data?.nickname} starts the quiz`);

        //방정보에 현재 퀴즈 답을 업데이트 한다.
        this.quizzesService.updateRoomAnswer(data["room"], newQuiz.answer);

        //5초간의 준비 시간을 1초간격으로 카운트다운해서 보낸 다음에 퀴즈를 보낸다.
        await startCountdown(5, this.server, data);

        client.to(data["room"]).emit("quize", newQuiz);
        //startQuizCountdown(15, this.server, data);

        return this.quizzesService.startQuiz(randomNum);
    }

    @Process("MessageQueue")
    async handleChatMessage(job: Job<any>) {
        this.logger.verbose(`Processing job ${job.id} of type ${job.name}`);
        // this.server
        //     .to(`${job.data.data["room"]}`)
        //     .emit(
        //         "message",
        //         `${job.data.data["nickname"]} : ${job.data.data["message"]}`,
        //     );
        const data = job.data.data;
        //Server 형식 타입을 Socket타입으로 바꾸기
        const client = this.server;

        const answerCheck = await this.quizzesService.checkAnswer(
            data["message"],
            data["room"],
        );
        console.log("answerCheck", answerCheck);
        //아무입력값도 없다면 무시한다.
        if (data["message"] === "") {
            return;
        }
        //치트키 요소입니다... 정답을 모를땐 사용하세요 !answer
        if (data["message"] === "!answer") {
            // 치트키 로그
            this.logger.verbose(`User ${data?.nickname} used used cheat code`);
            client.to(data["room"]).emit("notice", `정답은 ${data["answer"]}`);
            return;
        }

        if (answerCheck) {
            //채팅 내용을 프론트 앤드로 보낸다
            client
                .to(data["room"])
                .emit("message", `${data["nickname"]} : ${data["message"]}`);
            //정답이므로 정답 축하 메세지를 보낸다.
            client
                .to(data["room"])
                .emit(
                    "notice",
                    `★☆★☆★☆★☆${data["nickname"]}님이 정답을 맞추셨습니다 (+${data["point"]}점)★☆★☆★☆★☆`,
                );
            //stopQuizCountdown(client, data);
            //console.log("data", data);
            //console.log("기록으로 리턴합니다");
            //정답자가 나왔으므로 중간결과를 저장한다.
            const UpdateRecordDto = {
                userId: data["userId"], //유저의 아이디를 가져와야한다.
                socketId: job.data.data.clientId,
                roomId: data["room"], //생성될때의 방 값을 가져와야한다.
                userName: data["nickname"], //유저의 이름을 가져와야한다.
                userScore: data["point"], //점수 기입방식의 논의가 필요하다.
            };
            //퀴즈 중간 결과 값을 업데이트한다.
            await this.RecordsService.update(UpdateRecordDto);

            //현재 방 참가자들의 퀴즈 점수 값을 확인하고 프롱트 앤드로 전달한다.
            const roomRecord = await this.RecordsService.getRoomRecord(
                data["room"],
            );
            //console.log("roomRecord", roomRecord);

            this.logger.verbose(`Sending room record to ${roomRecord}`);
            //roomRecord를 스트링ㅇ로 변환하여 프론트앤드로 보낸다.

            client.to(data["room"]).emit("participant", roomRecord);

            //퀴즈 DB의 총 갯수를 구한다.
            const quizCount = await this.quizzesService.getQuizCount();

            //랜덤한 id값을 생성하고 그 id값의 퀴즈를 고른다.
            const randomNum = Math.floor(Math.random() * quizCount) + 1;
            const newQuiz = await this.quizzesService.startQuiz(randomNum);
            //await startCountdown(5, client, data);

            //방정보에 현재 퀴즈 답을 업데이트 한다.
            this.quizzesService.updateRoomAnswer(data["room"], newQuiz.answer);
            //퀴즈를 프론트앤드로 보낸다.
            client.to(data["room"]).emit("quiz", newQuiz);
            await startQuizCountdown(10, client, data);
            //console.log("quiz", newQuiz);퀴즈 확인용 출력입니다 주석처리 합니다
        } else {
            //정답이 아니므로 채팅 내용만 프론트로 보낸다
            this.logger.verbose(`${data["nickname"]} : ${data["message"]}`);
            client
                .to(data["room"])
                .emit("message", `${data["nickname"]} : ${data["message"]}`);
        }
    }
}
let countDownQuiz;

function startCountdown(
    seconds: number,
    client: Server,
    data: any,
): Promise<void> {
    return new Promise((resolve) => {
        let counter: number = seconds;

        const countdown = setInterval(() => {
            client.to(data["room"]).emit("readyTime", counter);
            counter--;
            if (counter < 0) {
                clearInterval(countdown);
                resolve();
            }
        }, 1000);
    });
}
//퀴즈가 진행 되는 동안 카우트다운을 하는 함수
function startQuizCountdown(
    seconds: number,
    client: Server,
    data: any,
): Promise<void> {
    return new Promise((resolve) => {
        let counter: number = seconds;

        countDownQuiz = setInterval(() => {
            client.to(data["room"]).emit("quizTime", counter);
            counter--;
            if (counter < 0) {
                clearInterval(countDownQuiz);
                resolve();
            }
        }, 1000);
    });
}

// 퀴즈가 진행되는 동안 카운트 다운 하는 도중 정답을 맞춘 사람이 생길 경우 카운트를 중단 하는함수
function stopQuizCountdown(client: Server, data: any): Promise<void> {
    clearInterval(countDownQuiz);
    client.to(data["room"]).emit("quizTime", "");
    return;
}
