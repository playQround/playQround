import { CacheManagerOptions, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Quizzes } from "./entities/quizzes.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { join } from "path";
const winston = require("winston");

@Injectable()
export class QuizzesRepository {
    private readonly logger = winston.createLogger({
        level: "info",
        format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.json(),
        ),
        transports: [
            new winston.transports.File({
                filename: join(__dirname, "../../test/info.log"),
            }),
        ],
    });
    constructor(
        @InjectRepository(Quizzes)
        private quizzesRepository: Repository<Quizzes>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache, // 캐시를 사용하기 위해 추가
    ) {}

    async start(id: string, quizCount: number): Promise<any> {
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

        const quizIdList = await generateRandomQuizzes(quizCount);

        const quizList = await this.quizzesRepository
            .createQueryBuilder("quizzes")
            .where("quizzes.quizid IN (:id)", { id: quizIdList })
            .getMany();

        return { quizzes: quizList };
    }

    //퀴즈 DB에서 quizId 기준으로 퀴즈를 찾는다. (Redis Cache 적용)
    async startQuiz(quizId: number): Promise<Quizzes> {
        this.logger.info(
            "quizzes repository startQuiz, before find cachedQuiz",
        );
        try {
            // 캐시에서 해당 퀴즈를 찾는다.
            const cachedQuiz = await this.cacheManager.get<Quizzes>(
                `quiz_${quizId}`,
            );
            if (cachedQuiz) {
                return cachedQuiz;
            }
        } catch (error) {
            this.logger.info(
                `quizzes repository startQuiz, error while find cachedQuiz ${error}`,
            );
        }

        this.logger.info(
            "quizzes repository startQuiz, if there is no cachedQuiz, find one",
        );
        // 캐시에 해당 퀴즈가 없는 경우, DB에서 모든 퀴즈를 찾아 캐시에 넣는다.
        const quiz = await this.quizzesRepository.findOne({
            where: { quizid: quizId },
        });
        this.logger.info("quizzes repository startQuiz, save a quiz to cache");
        try {
            await this.cacheManager.set(`quiz_${quiz.quizid}`, quiz, 3000000); // Cache for 50 minutes
        } catch (error) {
            this.logger.info(
                `quizzes repository startQuiz, save a quiz to cache while error with ${error}`,
            );
        }

        this.logger.info("quizzes repository startQuiz, return");
        return quiz;
    }

    // //퀴즈 DB에서 quizId 기준으로 퀴즈를 찾는다. (Redis Cache 적용)
    // async startQuiz(quizId: number): Promise<Quizzes> {
    //     // 캐시에서 해당 퀴즈를 찾는다.
    //     const cachedQuiz = await this.cacheManager.get<Quizzes>(
    //         `quiz_${quizId}`,
    //     );
    //     if (cachedQuiz) {
    //         return cachedQuiz;
    //     }

    //     const quizCount = await this.getQuizCount();
    //     const randomNum = Math.floor(Math.random() * quizCount) + 1;
    //     const quiz = await this.quizzesRepository.findOne({
    //         where: {
    //             quizid: randomNum,
    //         },
    //     });
    //     await this.cacheManager.set(`quiz_${quiz.quizid}`, quiz, 3000); // Cache for 50 minutes

    //     return quiz;
    // }

    //퀴즈 DB의 총 갯수를 구한다. (Redis Cache 적용)
    async getQuizCount(): Promise<number> {
        this.logger.info("quizzes repository getQuizCount before cachedCount");
        // 레디스 캐시 서버에서 문제 총 개수 조회
        try {
            const cachedCount = await this.cacheManager.get<number>(
                "quizCount",
            );
            if (cachedCount) {
                return cachedCount;
            }
        } catch (error) {
            this.logger.info(
                `quizzes repository getQuizCount get error ${error}`,
            );
        }

        this.logger.info("quizzes repository getQuizCount after cachedCount");
        // 레디스 캐시 서버에 문제 총 개수에 대한 정보가 없는 경우 데이터베이스에서 직접 조회 및 해당 값을 캐시 서버에 등록
        const count = await this.quizzesRepository.count();
        try {
            this.cacheManager.set("quizCount", count, 3000000); // Cache for 50 minutes
        } catch (error) {
            this.logger.info(
                `quizzes repository getQuizCount after cachedCount while error with ${error}`,
            );
        }

        return count;
    }
}
