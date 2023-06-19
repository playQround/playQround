import { Module } from "@nestjs/common";
import { QuizzesService } from "./quizzes.service";
import { QuizzesGateway } from "./quizzes.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quizzes } from "./entities/quizzes.entity";

import { RecordsService } from "src/records/records.service";
import { Record, RecordSchema } from "../records/schema/records.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { RecordsRepository } from "src/records/records.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([Quizzes]),
        MongooseModule.forFeature([
            { name: Record.name, schema: RecordSchema },
        ]),
    ],

    providers: [
        QuizzesGateway,
        QuizzesService,
        RecordsService,
        RecordsRepository,
    ],
})
export class QuizzesModule {}
