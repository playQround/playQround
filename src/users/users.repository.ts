import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(Users) private usersRepository: Repository<Users>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<Object> {
        const user = new Users();
        user.userEmail = createUserDto.userEmail;
        user.userName = createUserDto.userName;
        user.userPassword = createUserDto.userPassword;
        await this.usersRepository.save(user);
        return user;
    }

    // 비밀번호 미포함
    async find(userData: Partial<Users>): Promise<Object> {
        const user = await this.usersRepository.find({
            select: [
                "userId",
                "userEmail",
                "userName",
                "userRating",
                "createdAt",
                "updatedAt",
            ],
            where: {
                ...userData,
            },
        });
        return user;
    }

    // 비밀번호 포함 조회
    async findOne(userData: Partial<Users>): Promise<Object> {
        const user = await this.usersRepository.find({
            where: {
                ...userData,
            },
        });
        return user;
    }

    async update() {
        return;
    }
}
