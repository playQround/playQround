import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
    //const app = await NestFactory.create(AppModule);
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log(join(__dirname, "../.."));
    app.useStaticAssets(join(__dirname, "../.."));
    app.setGlobalPrefix("api");
    await app.listen(3000);
}
bootstrap();
