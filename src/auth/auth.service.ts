import { Inject, Injectable, Res, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import authConfig from "src/config/authConfig";
import { UsersRepository } from "src/users/users.repository";
import * as jwt from "jsonwebtoken";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private usersRepository: UsersRepository,
        private jwtService: JwtService,
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    ) {}

    async signIn(
        userEmail: string,
        userPassword: string,
        @Res() res: any,
    ): Promise<any> {
        // console.log("service start")
        const user = await this.usersRepository.findOne({ userEmail });
        // 유저 유효성 검사 필요
        if (!user[0] && user[0].userPassword === userPassword) {
            throw new UnauthorizedException("토큰 유효성 검증에 실패");
        }

        // jwt 토큰 생성
        const payload = { ...user[0] };

        const token = jwt.sign(payload, this.config.jwtSecret, {
            expiresIn: "1h",
        });

        // 쿠키로 토큰 설정
        await res.cookie("authorization", `Bearer ${token}`, {
            secure: false,
            samesite: "none",
        });

        // jwt 토큰 반환
        return token;
    }
}
