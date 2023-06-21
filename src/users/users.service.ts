import { Inject, Injectable, Res } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
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
