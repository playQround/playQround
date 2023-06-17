import { Module } from "@nestjs/common";
import { QuizzesService } from "./quizzes.service";
import { QuizzesGateway } from "./quizzes.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quizzes } from "./entities/quizzes.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Quizzes])],
    providers: [QuizzesGateway, QuizzesService],
})
export class QuizzesModule {}
