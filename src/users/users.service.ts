import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository
    ) {}

    async signUp(createUserDto: CreateUserDto): Promise<Object> {
        const user = await this.usersRepository.create(createUserDto);
        return user;
    }

    async findAll() {
        return `This action returns all users`;
    }

    async findOne(id: number) {
        return `This action returns a #${id} user`;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    async remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
