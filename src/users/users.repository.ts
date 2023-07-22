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

    // 유저 생성
    async create(
        createUserDto: CreateUserDto,
        verifyToken: string,
    ): Promise<Object> {
        const user = new Users();
        user.userEmail = createUserDto.userEmail;
        user.userName = createUserDto.userName;
        user.userPassword = createUserDto.userPassword;
        user.verifyToken = verifyToken;
        await this.usersRepository.save(user);
        return user;
    }

    // 비밀번호 미포함 조회
    async findOneInfo(userData: Partial<Users>): Promise<Object> {
        const user = await this.usersRepository.findOne({
            select: [
                "userEmail",
                "userName",
                "userRating",
                "totalCorrect",
                "maxCombo",
                "firstPlace",
            ],
            where: {
                ...userData,
            },
        });
        return user;
    }

    // 비밀번호 포함 조회
    async findOneAll(userData: Partial<Users>): Promise<Object> {
        const user = await this.usersRepository.findOne({
            where: {
                ...userData,
            },
        });
        return user;
    }

    // 유저 활성화
    async update(verifyToken: string): Promise<boolean> {
        await this.usersRepository.update({ verifyToken }, { active: true });
        return true;
    }

    // 유저 레이팅 변경
    async updateRecord(
        userId: number,
        userScore: number,
        nowCorrect: number,
        maxCombo: number,
    ): Promise<boolean> {
        const user = await this.usersRepository.findOne({
            where: {
                userId,
            },
        });

        if (!user) {
            return false;
        }

        user.userRating += userScore;
        user.totalCorrect += nowCorrect;
        if (user.maxCombo < maxCombo) {
            user.maxCombo = maxCombo;
        }
        this.usersRepository.save(user);

        return true;
    }

    // 유저 랭킹 조회
    async findRanking(item: string, rank: number) {
        //item에 따라서 랭킹을 다르게 보여줌
        const ranking = await this.usersRepository.find({
            select: [
                "userName",
                "userRating",
                "totalCorrect",
                "maxCombo",
                "firstPlace",
            ],
            order: {
                [item]: "DESC",
            },
            take: rank,
        });
        return ranking;
    }
}
