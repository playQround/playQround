import { Injectable } from "@nestjs/common";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { Quizzes } from "./entities/quizzes.entity";
import { QuizzesRepository } from "./quizzes.repository";
import { RoomsRepository } from "src/rooms/rooms.repository";

@Injectable()
export class QuizzesService {
    constructor(
        private readonly quizzesRepository: QuizzesRepository,
        private readonly roomsRepository: RoomsRepository,
    ) {}

    //퀴즈 DB에서 quizId를 기준으로 퀴즈를 찾는다.
    startQuiz(quizId: number): Promise<Quizzes | null> {
        return this.quizzesRepository.startQuiz(quizId);
    }

    //정답을 체크한다. 유저가 입력한 message와 answer 정답을 비교 정답이면 true 오답이면 false를 반환한다.
    async checkAnswer(message: any, room: any): Promise<boolean> {
        const roomInfo = await this.roomsRepository.findOne(room);
        //console.log("answer_check", roomInfo);
        console.log("Message", message);
        console.log("answer_check", roomInfo["nowAnswer"]);
        if (message === roomInfo["nowAnswer"]) {
            return true;
        }
        return false;
    }

    //퀴즈 DB의 총 갯수를 구한다.
    getQuizCount(): Promise<number> {
        return this.quizzesRepository.getQuizCount();
    }

    updateRoomAnswer(roomId: number, answer: string): Promise<void> {
        this.roomsRepository.updateRoomAnswer(roomId, answer);
        return;
    }
    create(createQuizDto: CreateQuizDto) {
        return "This action adds a new quiz";
    }

    update(id: number, updateQuizDto: UpdateQuizDto) {
        return `This action updates a #${id} quiz`;
    }
}
