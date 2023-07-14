// Module Import
import { NestFactory } from "@nestjs/core"; // NestJS 애플리케이션을 만드는데 사용
import { ValidationPipe } from "@nestjs/common"; // 유효성 검사 파이프라인
import { Logger } from "@nestjs/common"; // 로깅 기능 제공
import { NestExpressApplication } from "@nestjs/platform-express"; // NestJS가 Express에 기반한 애플리케이션을 만들도록 지정
import { AppModule } from "./app.module"; // 애플리케이션의 루트 모듈
import { join } from "path"; // 경로 문자열을 결합하는데 사용
import * as cookieParser from "cookie-parser"; // 쿠키 파싱 미들웨어
import { Transport } from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: true,
    });

    // 카프카 마이크로서비스 추가(+하이브리드구성)
    app.connectMicroservice({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: ['20.200.220.40:9092','20.200.222.210:9092','20.200.219.239:9092'],
            },
            consumer: {
                groupId: 'playqround-group'
            }
        }
    })

    console.log(join(__dirname, "../test"));
    app.useStaticAssets(join(__dirname, "../test"));
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe()); // 입력값 유효성 검사를 위한 ValidationPipe 추가
    app.setGlobalPrefix("api");
    const port = 80;

    // 마이크로서비스 실행
    await app. startAllMicroservices();

    // 어플리케이션 실행
    await app.listen(port);
    Logger.log(`Application is running on port(${port})`);
}
bootstrap();
