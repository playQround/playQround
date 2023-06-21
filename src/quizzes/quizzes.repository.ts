import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Quizzes } from "./entities/quizzes.entity";

@Injectable()
export class QuizzesRepository {
    constructor(
        @InjectRepository(Quizzes)
        private quizzesRepository: Repository<Quizzes>,
    ) {}

    async start(quizCount: number): Promise<any> {
        // utils 로 보낼 함수
        const generateRandomQuizzes = async (quizCount: number) => {
            let quizArray = [];
            let checker = {};
            let randomQuiz: number;

            while (quizArray.length < quizCount) {
                // 아래 1000 값은 db 길이로 반환해야함.
                const count: number = await this.getQuizCount();
                randomQuiz = Math.floor(Math.random() * (count - 1)) + 1;

                // 이미 들어간 값인지 검사하면서 퀴즈 리스트에 넣음
                if (!checker[randomQuiz]) {
                    checker[randomQuiz] = 1;
                    quizArray.push(randomQuiz);
                }
            }

            return quizArray;
        };

        const quizIdList = generateRandomQuizzes(quizCount);

        const quizList = await this.quizzesRepository
            .createQueryBuilder()
            .where("quizzes.quizid IN (:id)", { id: quizIdList })
            .getMany();

        return { quizzes: quizList };
    }

    //퀴즈 DB에서 quizId 기준으로 퀴즈를 찾는다.
    async startQuiz(quizId: number): Promise<Quizzes | null> {
        return await this.quizzesRepository.findOneBy({ quizid: quizId });
    }

    //퀴즈 DB의 총 갯수를 구한다.
    async getQuizCount(): Promise<number> {
        return await this.quizzesRepository.count();
    }
}
