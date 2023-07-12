import { Inject, Injectable, Res, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import authConfig from "../config/authConfig";
import { UsersRepository } from "../users/users.repository";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { SignInDto } from "./dto/sign-in.dto";

@Injectable()
export class AuthService {
    constructor(
        private usersRepository: UsersRepository,
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    ) {}

    async signIn(signInDto: SignInDto, @Res() res: any): Promise<any> {
        try {
            // 입력한 이메일을 사용하는 유저 조회
            const user = await this.usersRepository.findOneAll({
                userEmail: signInDto.userEmail,
            });

            // 유저 유효성 검사
            if (!user) {
                throw new UnauthorizedException(
                    "아이디 또는 비밀번호가 일치하지 않습니다.",
                );
            }

            // 비밀번호 유효성 검사
            // bcrypt.compare 해시된 비밀번호를 비교하는 메서드
            // 단순히 문자열을 암호화하여 비교하여도 salt값이 매번 랜덤으로 할당됨으로 메서드롤 통해 비교 필요
            const passwordMatch = await bcrypt.compare(
                signInDto.userPassword,
                user["userPassword"],
            );
            if (!passwordMatch) {
                throw new UnauthorizedException(
                    "아이디 또는 비밀번호가 일치하지 않습니다.",
                );
            }

            // jwt 토큰 생성
            const payload = {
                userId: user["userId"],
                userEmail: user["userEmail"],
                userName: user["userName"],
                userRating: user["userRating"],
                createdAt: user["createdAt"],
                updatedAt: user["createdAt"],
            };
            const token = jwt.sign(payload, this.config.jwtSecret, {
                expiresIn: "1h",
            });

            // 쿠키로 토큰 설정
            // await res.cookie("authorization", `Bearer ${token}`, {
            //     secure: false,
            //     samesite: "none",
            // });

            // jwt 토큰 반환
            return token;
        } catch (error) {
            return res.status(500).json({
                message: JSON.stringify(error),
            });
        }
    }
}
