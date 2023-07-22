import {
    Controller,
    Get,
    Post,
    Body,
    Res,
    UseGuards,
    Req,
    HttpStatus,
    Query,
    Param,
    Logger,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthGuard } from "../auth/auth.guard";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { Request } from "express";
const fs = require("fs");

@Controller("users")
export class UsersController {
    // Logger 사용
    private readonly logger = new Logger(UsersController.name);
    constructor(private readonly usersService: UsersService) {}

    // 회원가입 Controller
    @Post("signup")
    async signUp(
        @Body() createUserDto: CreateUserDto, // dto를 통해 유효성 검증 진행
        @Res() res: any,
        @Req() req: Request,
    ): Promise<Object> {
        // 회원가입 시도 로그(회원가입 전이므로 ip 기준으로 로깅)
        const clientIp = req.ip;
        this.logger.verbose(
            `Attempting to sign up with user name: ${createUserDto.userName} with ip of ${clientIp}`,
        );
        await this.usersService.signUp(createUserDto);
        return res.status(HttpStatus.CREATED).json({
            message: "signed up",
        });
    }

    // 이메일 인증 Controller
    @Post("verify")
    async verifyEmail(
        @Query() verifyEmailDto: VerifyEmailDto,
        @Res() res: any,
    ): Promise<Object> {
        const { signupVerifyToken } = verifyEmailDto;
        await this.usersService.verifyEmail(signupVerifyToken);
        return res.status(HttpStatus.OK).json({
            message: "verified",
        });
    }

    // 유저 조회 Controller
    @UseGuards(AuthGuard)
    @Get("info")
    async getUserInfo(@Req() req: any, @Res() res: any): Promise<Object> {
        const user = req.user; // 유저 토큰 정보가 필요한 경우
        // 유저 정보 조회 로그
        this.logger.verbose(
            `Fetching user information for user with ID: ${user.userId}, Name: ${user.userName}`,
        );

        const userResult = await this.usersService.getUserInfo({
            userId: user.userId,
            userEmail: user.userEmail,
        });

        return res.status(HttpStatus.OK).json(userResult);
    }

    //userRating, totalCorrect, maxCombo 의 순위를 반환해주는 api
    @Get("rank/:item/:rank")
    async getRank(
        @Param("item") item: string,
        @Param("rank") rank: number,
        @Res() res: any,
    ): Promise<Object> {
        const userResult = await this.usersService.getRank(item, rank);
        return res.status(HttpStatus.OK).json(userResult);
    }
}
