import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";

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
    
    async findOne(singInDto: SignInDto): Promise<Object> {
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
                userEmail: singInDto.userEmail,
                userPassword: singInDto.userPassword
            },
        });
        return user;
    }
    
    async update() {
        return;
    }
    
    async remove() {
        return;
    }
}