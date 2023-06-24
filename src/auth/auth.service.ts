import { Inject, Injectable, Res, UnauthorizedException } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import authConfig from "src/config/authConfig";
import { UsersRepository } from "src/users/users.repository";
import * as jwt from "jsonwebtoken";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';

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
        // 비밀번호 비교를 위한 암호화
        const hashedPassword1 = await bcrypt.hash(userPassword, 10);
        const hashedPassword2 = await bcrypt.hash(userPassword, 10);

        // 입력한 이메일을 사용하는 유저 조회
        const user = await this.usersRepository.findOne({ userEmail });
   
        // 유저 유효성 검사
        if (!user) {
            throw new UnauthorizedException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // 비밀번호 유효성 검사
        // bcrypt.compare 해시된 비밀번호를 비교하는 메서드
        // 단순히 문자열을 암호화하여 비교하여도 salt값이 매번 랜덤으로 할당됨으로 메서드롤 통해 비교 필요
        const passwordMatch = await bcrypt.compare(userPassword, user['userPassword']);
        if (!passwordMatch) {
            throw new UnauthorizedException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // jwt 토큰 생성
        const payload = { ...user };
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
