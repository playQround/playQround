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
import { subscribe } from "diagnostics_channel";

@WebSocketGateway({ cors: true })
export class QuizzesGateway {
    private readonly logger = new Logger(QuizzesGateway.name);
    constructor(
        private readonly quizzesService: QuizzesService,
        private readonly RecordsService: RecordsService,
    ) {}
    @WebSocketServer() server: Server;
    //소켓에 접속 되었을때 실행
    //TODO 여기에 접속한 유저의 숫자를 카운트해야하나
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
    //TODO 여기에 접속한 유저의 숫자를 카운트해야하나
    //방에 입장했을 때 실행되는 서브스크립션
    @SubscribeMessage("joinRoom")
    async joinRoom(client: Socket, data: any) {
        //join을 통해 소켓의 room에 입장한다.
        client.join(data["room"]);

        // 방 입장 로그
        this.logger.verbose(`${data?.nickname} entered the room ${data?.room}`);
        //room에 입장했다는 메세지를 프론트앤드로 보낸다.
        client
            .to(data["room"])
            .emit("message", `${data["nickname"]} 님이 입장하셨습니다.`);

        //참여자목록을 업데이트한다.
        client.to(data["room"]).emit("participant", `${data["nickname"]}`);

        return;
    }

    //프론트 앤드 socket.emit("message", message, now_quiz_answer); 에 응답하기위한 서브스크립션
    @SubscribeMessage("message")
    async handleMessage(client: Socket, data: any) {
        //퀴즈의 정답을 체크한다. 정답이면 true 오답이면 false를 반환한다.
        const answerCheck = this.quizzesService.checkAnswer(
            data["message"],
            data["answer"],
        );
        //아무입력값도 없다면 무시한다.
        if (data["message"] === "") {
            return;
        }
        //치트키 요소입니다... 정답을 모를땐 사용하세요 !answer
        if (data["message"] === "!answer") {
            // 치트키 로그
            this.logger.verbose(`User ${data?.nickname} used used cheat code`);
            client
                .to(data["room"])
                .emit(
                    "message",
                    `${data["nickname"]} : 정답은 ${data["answer"]}`,
                );
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
                    "message",
                    `★☆★☆★☆★☆${data["nickname"]}님이 정답을 맞추셨습니다★☆★☆★☆★☆`,
                );
            stopQuizCountdown(client, data);
            //console.log("data", data);
            //console.log("기록으로 리턴합니다");
            //정답자가 나왔으므로 중간결과를 저장한다.
            const UpdateRecordDto = {
                userId: data["userid"], //유저의 아이디를 가져와야한다.
                roomId: data["room"], //생성될때의 방 값을 가져와야한다.
                userName: data["nickname"], //유저의 이름을 가져와야한다.
                userScore: 1, //점수 기입방식의 논의가 필요하다.
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

            client.to(data["room"]).emit("roomRecord", roomRecord);

            //퀴즈 DB의 총 갯수를 구한다.
            const quizCount = await this.quizzesService.getQuizCount();

            //랜덤한 id값을 생성하고 그 id값의 퀴즈를 고른다.
            const randomNum = Math.floor(Math.random() * quizCount) + 1;
            const newQuiz = await this.quizzesService.startQuiz(randomNum);
            await startCountdown(5, client, data);
            //퀴즈를 프론트앤드로 보낸다.
            client.to(data["room"]).emit("quize", newQuiz);
            await startQuizCountdown(10, client, data);
            //console.log("quize", newQuiz);퀴즈 확인용 출력입니다 주석처리 합니다
        } else {
            //정답이 아니므로 채팅 내용만 프론트로 보낸다
            client
                .to(data["room"])
                .emit("message", `${data["nickname"]} : ${data["message"]}`);
        }

        // return this.quizzesService.checkAnswer(
        //     data["nickname"],
        //     data["message"],
        // );

        return;
        //return this.RecordService.test(record);
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
                "message",
                `()()()()()()${data["nickname"]}님이 퀴즈를 시작하셨습니다.()()()()()()()`,
            );
        client.to(data["room"]).emit("startQuiz");
        this.logger.verbose(`User ${data?.nickname} starts the quiz`);

        //5초간의 준비 시간을 1초간격으로 카운트다운해서 보낸 다음에 퀴즈를 보낸다.
        await startCountdown(5, client, data);

        client.to(data["room"]).emit("quize", newQuiz);
        await startQuizCountdown(10, client, data);
        return this.quizzesService.startQuiz(randomNum);
    }

    @SubscribeMessage("createQuiz")
    create(@MessageBody() createQuizDto: CreateQuizDto) {
        return this.quizzesService.create(createQuizDto);
    }

    @SubscribeMessage("updateQuiz")
    update(@MessageBody() updateQuizDto: UpdateQuizDto) {
        return this.quizzesService.update(updateQuizDto.id, updateQuizDto);
    }

}
let countDownQuiz;

function startCountdown(
    seconds: number,
    client: Socket,
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
    client: Socket,
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
function stopQuizCountdown(client: Socket, data: any): Promise<void> {
    clearInterval(countDownQuiz);
    client.to(data["room"]).emit("quizTime", "");
    return;
}
