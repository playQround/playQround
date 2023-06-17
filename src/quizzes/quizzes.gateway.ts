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

@WebSocketGateway()
export class QuizzesGateway {
    constructor(private readonly quizzesService: QuizzesService) {}
    @WebSocketServer() server: Server;
    //소켓에 접속 되었을때 실행
    public handleConnection(client: Socket, ...args: any[]) {
        //이미 접속된 room에서 나간다? 이게 맞나? 안하면 뒤에 join 작동안함
        client.leave(client.id);

        console.log(`Client connected: ${client.id}`);
    }

    //소켓에 접속이 끊겼을때 실행
    async handleDisconnect(client: Socket, ...args: any[]) {
        console.log(`Client disconnected: ${client.id}`);
    }

    //방에 입장했을 때 실행되는 서브스크립션
    @SubscribeMessage("joinRoom")
    async joinRoom(client: Socket, data: any) {
        //join을 통해 소켓의 room에 입장한다.
        client.join(data["room"]);

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

            //퀴즈 DB의 총 갯수를 구한다.
            const quizCount = await this.quizzesService.getQuizCount();

            //랜덤한 id값을 생성하고 그 id값의 퀴즈를 고른다.
            const randomNum = Math.floor(Math.random() * quizCount) + 1;
            const newQuiz = await this.quizzesService.startQuiz(randomNum);

            //퀴즈를 프론트앤드로 보낸다.
            client.to(data["room"]).emit("quize", newQuiz);
            console.log("quize", newQuiz);
        } else {
            //정답이 아니므로 채팅 내용만 프론트로 보낸다
            client
                .to(data["room"])
                .emit("message", `${data["nickname"]} : ${data["message"]}`);
        }

        return this.quizzesService.checkAnswer(
            data["nickname"],
            data["message"],
        );
    }

    @SubscribeMessage("startQuiz")
    async startQuiz(client: Socket, data: any) {
        //퀴즈 DB의 총 갯수를 구한다.
        const quizCount = await this.quizzesService.getQuizCount();

        //랜덤한 id값을 생성하고 그 id값의 퀴즈를 고른다.
        const randomNum = Math.floor(Math.random() * quizCount) + 1;
        const newQuiz = await this.quizzesService.startQuiz(randomNum);

        //퀴즈를 프론트 앤드로 보낸다
        client.to(data["room"]).emit("quize", newQuiz);
        console.log("quize", newQuiz);
        console.log(`${data["nickname"]}님이 퀴즈를 시작하셨습니다.`);

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
