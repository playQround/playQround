import {
    Controller,
    Get,
    Post,
    Body,
    Res,
    UseGuards,
    Req,
    HttpStatus,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthGuard } from "src/auth/auth.guard";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // 회원가입 Controller
    @Post("signup")
    async signUp(
        @Body() createUserDto: CreateUserDto, // dto를 통해 유효성 검증 진행
        @Res() res: any,
    ): Promise<Object> {
        await this.usersService.signUp(createUserDto);
        return res.status(HttpStatus.CREATED).json({
            message: "signed up",
        });
    }

    // 유저 조회 Controller
    @UseGuards(AuthGuard)
    @Get("info")
    async getUserInfo(@Req() req: any, @Res() res: any): Promise<Object> {
        const user = req.user; // 유저 토큰 정보가 필요한 경우

        // console.log(user)
        const userResult = await this.usersService.getUserInfo({
            userId: user.userId,
            userEmail: user.userEmail,
        });

        return res.status(HttpStatus.OK).json(userResult);
    }
}
