// Module Import
import { NestFactory } from "@nestjs/core"; // NestJS 애플리케이션을 만드는데 사용
import { ValidationPipe } from "@nestjs/common"; // 유효성 검사 파이프라인
import { Logger } from "@nestjs/common"; // 로깅 기능 제공
import { NestExpressApplication } from "@nestjs/platform-express"; // NestJS가 Express에 기반한 애플리케이션을 만들도록 지정
import { AppModule } from "./app.module"; // 애플리케이션의 루트 모듈
import { join } from "path"; // 경로 문자열을 결합하는데 사용
import * as cookieParser from "cookie-parser"; // 쿠키 파싱 미들웨어

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: true,
    });
    console.log(join(__dirname, "../test"));
    app.useStaticAssets(join(__dirname, "../test"));
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe()); // 입력값 유효성 검사를 위한 ValidationPipe 추가
    app.setGlobalPrefix("api");
    const port = 80;
    await app.listen(port);
    Logger.log(`Application is running on port(${port})`);
}
bootstrap();
