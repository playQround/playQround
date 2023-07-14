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
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-ioredis";
import { ClientsModule, Transport } from "@nestjs/microservices";
@Module({
    imports: [
        TypeOrmModule.forFeature([Quizzes]),
        MongooseModule.forFeature([
            { name: Record.name, schema: RecordSchema },
        ]),
        BullModule.forRoot({
            redis: {
                host: "20.200.215.75",
                // host: process.env.REDIS_URL,
            },
        }),
        BullModule.registerQueue({
            name: "MessageQueue",
        }),
        forwardRef(() => RoomsModule),
        CacheModule.registerAsync({
            useFactory: () => ({
                store: redisStore,
                host: process.env.REDIS_URL,
                port: 6379,
                isGlobal: true,
                // ttl: 10000,
                // connectTimeout: 10000
                // url: 'redis://elastic-cluster.itqyqt.ng.0001.apn2.cache.amazonaws.com:6379',
            }),
        }),
        ClientsModule.register([
            {
                name: 'KAFKA', // injection token
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: 'server-1',
                        brokers: ['20.200.220.40:9092','20.200.222.210:9092','20.200.219.239:9092'],
                    },
                    consumer: {
                        groupId: 'playqround-group'
                    }
                }
            }
        ])
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
