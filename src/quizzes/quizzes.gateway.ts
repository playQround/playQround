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

    @SubscribeMessage("message")
    async handleMessage(socekt: Socket, data: any) {
        console.log(data);
        const answerCheck = this.quizzesService.checkAnswer(data[0], data[1]);
        if (answerCheck) {
            this.server.emit("message", `${socekt.id}client- said: ${data[0]}`);
            this.server.emit("message", `${socekt.id}님이 정답을 맞추셨습니다`);
            const randomNum = Math.floor(Math.random() * 20000) + 1;
            console.log(randomNum);
            const newQuiz = await this.quizzesService.startQuiz(randomNum);
            console.log("startQuiz", newQuiz);
            console.log(newQuiz);
            //console.log("startQuiz", id);
            //console.log("startQuiz", data);

            this.server.emit("quize", newQuiz);
        } else {
            this.server.emit("message", `${socekt.id}client- said: ${data[0]}`);
        }

        return this.quizzesService.checkAnswer(data[0], data[1]);
    }
    @SubscribeMessage("startQuiz")
    async startQuiz(@MessageBody() socekt: Socket, data: any) {
        const randomNum = Math.floor(Math.random() * 20000) + 1;
        console.log(randomNum);
        const newQuiz = await this.quizzesService.startQuiz(randomNum);
        console.log("startQuiz", newQuiz);
        console.log(newQuiz);
        //console.log("startQuiz", id);
        //console.log("startQuiz", data);

        this.server.emit("quize", newQuiz);

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
