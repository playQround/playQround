import { BadRequestException, Inject, Injectable, Res } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersRepository } from "./users.repository";
import authConfig from "src/config/authConfig";
import { ConfigType } from "@nestjs/config";

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    ) {}

    // 회원가입 Service
    async signUp(createUserDto: CreateUserDto): Promise<Object> {
        // 이메일 중복확인
        const checkEmail = await this.usersRepository.findOne({
            userEmail: createUserDto.userEmail,
        })
        console.log(checkEmail)
        if (checkEmail) {
            throw new BadRequestException('이미 사용 중인 userEmail입니다.');
        }

        // 사용자명 중복확인
        const checkUserName = await this.usersRepository.findOne({
            userName: createUserDto.userName,
        })
        if (checkUserName) {
            throw new BadRequestException('이미 사용 중인 userName입니다.');
        }

        // 암호화된 비밀번호 저장

        // 이메일 인증

        const user = await this.usersRepository.create(createUserDto);
        return user;
    }

    // 유저 조회 Service
    async getUserInfo(dto: object): Promise<Object> {
        const user = await this.usersRepository.find(dto);
        console.log(user[0]);
        return {
            userEmail: user[0].userEmail,
            userName: user[0].userName,
            userRating: user[0].userRating,
        };
    }
}
