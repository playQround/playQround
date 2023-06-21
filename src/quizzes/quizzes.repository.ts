import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quizzes } from './entities/quizzes.entity'

@Injectable()
export class QuizzesRepository {
    constructor(
        @InjectRepository(Quizzes)
        private QuizzesRepository: Repository<Quizzes>,
    ) {}
    
    async start(quizCount: number): Promise<any>{
        // utils 로 보낼 함수
        const generateRandomQuizzes = (quizCount: number) => {
            let quizArray = [];
            let checker = {};
            let randomQuiz;

            while(quizArray.length < quizCount ){
                // 아래 1000 값은 db 길이로 반환해야함.
                randomQuiz = Math.floor(Math.random() * (1000 - 1)) + 1;
                
                // 이미 들어간 값인지 검사하면서 퀴즈 리스트에 넣음
                if (!checker[randomQuiz]){
                    checker[randomQuiz] = 1;
                    quizArray.push(randomQuiz);
                }
            }

            return quizArray;
        }
        
        const quizIdList = generateRandomQuizzes(quizCount);

        const quizList = await this.QuizzesRepository.createQueryBuilder()
                            .where("quizzes.quizid IN (:id)", {id : quizIdList})
                            .getMany();
        
        return {quizzes : quizList};
    }

    }

