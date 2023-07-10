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

    // 익명 접속자의 임시 userId 생성 메서드
    anonymousUserId(): number {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 100);
        return timestamp + random;
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

    // 퀴즈 조회 서비스
    async getQuiz(): Promise<any> {
        // 퀴즈 DB의 총 갯수를 구한다.
        const quizCount = await this.quizzesRepository.getQuizCount();

        //랜덤한 id값을 생성하고 그 id값의 퀴즈를 고른다.
        const randomNum = Math.floor(Math.random() *  quizCount) + 1;

        // 퀴즈 DB에서 quizId를 기준으로 퀴즈를 찾는다.
        const newQuiz = await this.quizzesRepository.startQuiz(randomNum);
        return newQuiz;
    }

    // //퀴즈 DB에서 quizId를 기준으로 퀴즈를 찾는다.
    // startQuiz(quizId: number): Promise<Quizzes | null> {
    //     return this.quizzesRepository.startQuiz(quizId);
    // }
    // //퀴즈 DB의 총 갯수를 구한다.
    // getQuizCount(): Promise<number> {
    //     return this.quizzesRepository.getQuizCount();
    // }

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
