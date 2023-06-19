import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { Repository } from "typeorm";
import { Quizzes } from "./entities/quizzes.entity";

@Injectable()
export class QuizzesService {
    constructor(
        @InjectRepository(Quizzes)
        private quizRepository: Repository<Quizzes>,
    ) {}

    startQuiz(quizid: number): Promise<Quizzes | null> {
        console.log("Service", quizid);
        return this.quizRepository.findOneBy({ quizid });
    }

    checkAnswer(data_0: any, data_1: number): boolean {
        console.log("checkAnswer_0", data_0);
        console.log("checkAnswer_1", data_1);
        //const answer = this.quizRepository.findOneBy({ id });
        //console.log("checkAnswer_2", answer);
        //this.quizRepository.findOneBy({ id: 1 });
        //const answer :Promise<string> = ;
        if (data_0 === data_1) {
            console.log("정답입니다~");
            return true;
        }
        return false;
    }

    create(createQuizDto: CreateQuizDto) {
        return "This action adds a new quiz";
    }

    update(id: number, updateQuizDto: UpdateQuizDto) {
        return `This action updates a #${id} quiz`;
    }
}
