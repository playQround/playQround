import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
} from "@nestjs/websockets";
import { QuizzesService } from "./quizzes.service";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";

@WebSocketGateway()
export class QuizzesGateway {
    constructor(private readonly quizzesService: QuizzesService) {}

    @SubscribeMessage("createQuiz")
    create(@MessageBody() createQuizDto: CreateQuizDto) {
        return this.quizzesService.create(createQuizDto);
    }

    @SubscribeMessage("findAllQuizzes")
    findAll() {
        return this.quizzesService.findAll();
    }

    @SubscribeMessage("findOneQuiz")
    findOne(@MessageBody() id: number) {
        return this.quizzesService.findOne(id);
    }

    @SubscribeMessage("updateQuiz")
    update(@MessageBody() updateQuizDto: UpdateQuizDto) {
        return this.quizzesService.update(updateQuizDto.id, updateQuizDto);
    }

    @SubscribeMessage("removeQuiz")
    remove(@MessageBody() id: number) {
        return this.quizzesService.remove(id);
    }
}
