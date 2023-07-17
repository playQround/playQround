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

    //퀴즈 DB에서 quizId 기준으로 퀴즈를 찾는다. (Redis Cache 적용)
    async startQuiz(quizId: number): Promise<Quizzes> {
        try {
            this.logger.info(
                "quizzes repository startQuiz, before find cachedQuiz",
            );
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

        try {
            this.logger.info(
                "quizzes repository startQuiz, if there is no cachedQuiz, find one",
            );
            // 캐시에 해당 퀴즈가 없는 경우, DB에서 모든 퀴즈를 찾아 캐시에 넣는다.
            const quiz = await this.quizzesRepository.findOne({
                where: { quizid: quizId },
            });
            this.logger.info(
                "quizzes repository startQuiz, save a quiz to cache",
            );
            await this.cacheManager.set(`quiz_${quiz.quizid}`, quiz, 3000000); // Cache for 50 minutes
            this.logger.info("quizzes repository startQuiz, return");
            return quiz;
        } catch (error) {
            this.logger.info(
                `quizzes repository startQuiz, save a quiz to cache while error with ${error}`,
            );
        }
    }

    //퀴즈 DB의 총 갯수를 구한다. (Redis Cache 적용)
    async getQuizCount(): Promise<number> {
        try {
            this.logger.info(
                "quizzes repository getQuizCount before cachedCount",
            );
            // 레디스 캐시 서버에서 문제 총 개수 조회
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

        try {
            this.logger.info(
                "quizzes repository getQuizCount after cachedCount",
            );
            // 레디스 캐시 서버에 문제 총 개수에 대한 정보가 없는 경우 데이터베이스에서 직접 조회 및 해당 값을 캐시 서버에 등록
            const count = await this.quizzesRepository.count();
            this.cacheManager.set("quizCount", count, 3000000); // Cache for 50 minutes
            return count;
        } catch (error) {
            this.logger.info(
                `quizzes repository getQuizCount after cachedCount while error with ${error}`,
            );
        }
    }
}
