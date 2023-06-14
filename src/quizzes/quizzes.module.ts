import { Module } from "@nestjs/common";
import { QuizzesService } from "./quizzes.service";
import { QuizzesGateway } from "./quizzes.gateway";

@Module({
    providers: [QuizzesGateway, QuizzesService],
})
export class QuizzesModule {}
