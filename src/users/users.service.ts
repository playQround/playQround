import { Inject, Injectable, Res } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";
import { SignInDto } from "./dto/sign-in.dto";
import * as jwt from 'jsonwebtoken';
import authConfig from "src/config/authConfig";
import { ConfigType } from "@nestjs/config";

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository, 
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>
    ) {}

    async signUp(createUserDto: CreateUserDto): Promise<Object> {
        const user = await this.usersRepository.create(createUserDto);
        return user;
    }

    async signIn(singInDto: SignInDto, @Res() res: any): Promise<Object> {
        const user = await this.usersRepository.findOne(singInDto);
        const payload = { ...user };

        // jwt 토큰 생성
        const token = jwt.sign(payload, this.config.jwtSecret, { expiresIn: '1h' })

        // 쿠키로 토큰 설정
        const a = await res.cookie('authorization', `Bearer ${token}`, { secure: true });
        
        // jwt 토큰 반환
        return token;
    }
}
