import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { RoomsModule } from "./rooms/rooms.module";
import { QuizzesModule } from "./quizzes/quizzes.module";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MongooseModule } from "@nestjs/mongoose";
import authConfig from "./config/authConfig";
import { AuthModule } from "./auth/auth.module";
import emailConfig from "./config/emailConfig";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-ioredis";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [authConfig, emailConfig],
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: "mysql",
            host: process.env.DATABASE_HOST,
            port: +process.env.DATABASE_PORT,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: [__dirname + "/**/*.entity{.ts,.js}"],
            synchronize: false, // 동기화 옵션 해제
        }),
        MongooseModule.forRoot(process.env.MONGODB_URL),
        UsersModule,
        RoomsModule,
        QuizzesModule,
        AuthModule,
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
                },
                producer: {
                    allowAutoTopicCreation: true, // 토픽 자동 생성 허용 여부
                }
              }
            }
          ])
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
