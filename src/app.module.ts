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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
