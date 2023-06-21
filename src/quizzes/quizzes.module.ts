import { Module } from "@nestjs/common";
import { QuizzesService } from "./quizzes.service";
import { QuizzesGateway } from "./quizzes.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quizzes } from "./entities/quizzes.entity";
import { QuizzesRepository } from "./quizzes.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Quizzes])],
    providers: [QuizzesGateway, QuizzesService, QuizzesRepository],
    exports : [QuizzesRepository]
})
export class QuizzesModule {}
