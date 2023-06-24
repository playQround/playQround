import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    //const app = await NestFactory.create(AppModule);
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log(join(__dirname, "../test"));
    app.useStaticAssets(join(__dirname, "../test"));
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe()); // 입력값 유효성 검사를 위한 ValidationPipe 추가
    app.setGlobalPrefix("api");
    await app.listen(3000);
}
bootstrap();
