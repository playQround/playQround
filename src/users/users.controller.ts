import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { SignInDto } from "./dto/sign-in.dto";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // 회원가입
    @Post('signup')
    async signUp(@Body() createUserDto: CreateUserDto, @Res() res: any): Promise<Object> {
        await this.usersService.signUp(createUserDto);
        return res.status(201).json({
            "message": "signed up"
        });
    }

    // 로그인
    @Post('signin')
    async signIn(@Body() signInDto: SignInDto, @Res() res: any): Promise<any> {
        const result = await this.usersService.signIn(signInDto, res);

        return res.status(200).json({
            "message": "signed in"
        });
    }

    // @Get()
    // findAll() {
    //     return this.usersService.findAll();
    // }

    // @Get(":id")
    // findOne(@Param("id") id: string) {
    //     return this.usersService.findOne(+id);
    // }

    // @Patch(":id")
    // update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    //     return this.usersService.update(+id, updateUserDto);
    // }

    // @Delete(":id")
    // remove(@Param("id") id: string) {
    //     return this.usersService.remove(+id);
    // }
}
