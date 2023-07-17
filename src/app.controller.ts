import { Controller, Get, Res } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("api")
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("log")
    getHello(@Res() res: any): string {
        return;
    }
}
