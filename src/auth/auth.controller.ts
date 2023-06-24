import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("signin")
    async signIn(@Body() signInDto: SignInDto, @Res() res: any) {
        await this.authService.signIn(
            signInDto.userEmail,
            signInDto.userPassword,
            res,
        );
        return res.status(HttpStatus.OK).json({
            message: "signed in",
        });
    }
}
