import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";

@Controller("auth")
export class AuthController {
    // Logger 사용
    private readonly logger = new Logger(AuthController.name);
    constructor(private authService: AuthService) {}

    @Post("signin")
    async signIn(@Body() signInDto: SignInDto, @Res() res: any) {
        try {
            this.logger.verbose(`User signing in: ${signInDto.userEmail}`);
            const token = await this.authService.signIn(signInDto, res);
            return res.status(HttpStatus.OK).json({
                message: "signed in",
                token,
            });
        } catch (error) {
            return res.status(HttpStatus.OK).json({
                message: JSON.stringify(error),
            });
        }
    }
}
