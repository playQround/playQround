import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule, 
        { cors : true }
    );
    app.enableCors();
    console.log(join(__dirname, "../test"));
    app.useStaticAssets(join(__dirname, "../test"));
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe()); // 입력값 유효성 검사를 위한 ValidationPipe 추가
    app.setGlobalPrefix("api");
    const port = 3000;
    await app.listen(port);
    Logger.log(`Application is running on port(${port})`);
}
bootstrap();
