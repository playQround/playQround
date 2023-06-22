import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
    UseGuards,
    Req,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthGuard } from "src/auth/auth.guard";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // 회원가입
    @Post("signup")
    async signUp(
        @Body() createUserDto: CreateUserDto,
        @Res() res: any,
    ): Promise<Object> {
        await this.usersService.signUp(createUserDto);
        return res.status(201).json({
            message: "signed up",
        });
    }

    // 유저 조회
    @UseGuards(AuthGuard)
    @Get("info")
    async getUserInfo(@Req() req: any): Promise<any> {
        const user = req.user; // 유저 토큰 정보가 필요한 경우
        return await this.usersService.getUserInfo({
            userId: user.userId,
            userEmail: user.userEmail,
        });
    }
}
