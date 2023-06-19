import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(Users) private usersRepository: Repository<Users>
    ) {}

    async create(createUserDto: CreateUserDto): Promise<Object> {
        const user = new Users();
        user.userEmail = createUserDto.userEmail;
        user.userName = createUserDto.userName;
        user.userPassword = createUserDto.userPassword;
        await this.usersRepository.save(user);
        return user;
    }
    async findAll() {
        return;
    }
    async findOne() {
        return;
    }
    async update() {
        return;
    }
    async remove() {
        return;
    }
}