import { BadRequestException, Inject, Injectable, Res } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersRepository } from "./users.repository";
import authConfig from "src/config/authConfig";
import { ConfigType } from "@nestjs/config";
import * as bcrypt from 'bcrypt';

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
        // 10으로 입력된 인자는 salt로 사용할 숫자 -> 숫자가 높을수록 암호화 강도가 높아지지만 암호화에 소요되는 시간도 증가(10~12 권장)
        const hashedPassword = await bcrypt.hash(createUserDto.userPassword, 10);

        // 이메일 인증

        // 유저 생성
        const user = await this.usersRepository.create({ ...createUserDto, userPassword: hashedPassword});
        return user;
    }

    // 유저 조회 Service
    async getUserInfo(dto: object): Promise<Object> {
        const user = await this.usersRepository.find(dto);
        return {
            userEmail: user[0].userEmail,
            userName: user[0].userName,
            userRating: user[0].userRating,
        };
    }
}
