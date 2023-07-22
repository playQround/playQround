import { Module, forwardRef } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { RoomsController } from "./rooms.controller";
import { Room, RoomSchema } from "./schemas/room.schema";
import { RoomsRepository } from "./rooms.repository";
import { QuizzesModule } from "../quizzes/quizzes.module";
import { RecordsModule } from "src/records/records.module";
import { RecordsRepository } from "../records/records.repository";
import { Record, RecordSchema } from "../records/schema/records.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "src/users/users.module";
import { UsersRepository } from "src/users/users.repository";
import { Users } from "../users/entities/user.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as redisStore from "cache-manager-ioredis";

@Module({
    imports: [
        RecordsModule,
        UsersModule,
        QuizzesModule,
        MongooseModule.forFeature([
            { name: Room.name, schema: RoomSchema },
            { name: Record.name, schema: RecordSchema },
        ]),
        TypeOrmModule.forFeature([Users]),
        forwardRef(() => QuizzesModule), // 모듈의 순환 참조 해결을 위해 forwardRef()함수 사용
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
    ], // entity 사용을 위해 등록 - Mongoose ver.
    controllers: [RoomsController],
    providers: [
        RoomsService,
        RoomsRepository,
        RecordsRepository,
        UsersRepository,
    ],
    exports: [RoomsRepository],
})
export class RoomsModule {}
