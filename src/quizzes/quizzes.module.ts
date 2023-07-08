import { Module, forwardRef } from "@nestjs/common";
import { QuizzesService } from "./quizzes.service";
import { QuizzesGateway } from "./quizzes.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quizzes } from "./entities/quizzes.entity";
import { QuizzesRepository } from "./quizzes.repository";
import { RecordsService } from "../records/records.service";
import { Record, RecordSchema } from "../records/schema/records.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { RecordsRepository } from "../records/records.repository";
import { BullModule } from "@nestjs/bull";
import { RoomsModule } from "../rooms/rooms.module";
import { RoomsService } from "../rooms/rooms.service";
@Module({
    imports: [
        TypeOrmModule.forFeature([Quizzes]),
        MongooseModule.forFeature([
            { name: Record.name, schema: RecordSchema },
        ]),
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_URL,
            },
        }),
        BullModule.registerQueue({
            name: "MessageQueue",
        }),
        forwardRef(() => RoomsModule),
    ],
    providers: [
        QuizzesGateway,
        QuizzesService,
        QuizzesRepository,
        RecordsService,
        RecordsRepository,
        RoomsService,
    ],
    exports: [QuizzesRepository],
})
export class QuizzesModule {}
