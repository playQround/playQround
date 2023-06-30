1. 필요 모듈 설치
```
npm i --save @nestjs/config // config 패키지 (dotenv와 유사한 기능)
npm i --save @nestjs/typeorm typeorm mysql2 // typeorm 및 mysql 패키지
npm i @nestjs/mongoose mongoose // mongodb 패키지
npm i jsonwebtoken // jwt 패키지
npm i --save-dev @types/jsonwebtoken // jwt 패키지
npm i cookie-parser // 쿠키 Parser 패키지
npm i bcrypt // 비밀번호 암호화를 위한 패키지
npm i --save-dev @types/bcrypt
npm i uuid // uuid 생성용 패키지
npm i --save-dev @types/uuid
npm i nodemailer
npm i --save-dev @types/nodemailer
```

2. Config(dotenv와 유사한 서비스) 설정
```
// app.module.ts 파일 설정 추가
// imports 항목에 아래와 같이 env 파일 경로 추가
@Module({
    imports: [ConfigModule.forRoot({
        load: [authConfig],
        isGlobal: true, // 전역 모듈로 설정
    })],
})

// 루트경로에 .env 파일 생성 및 아래 내용 추가
DATABASE_HOST=<SQLDB호스트경로>
DATABASE_PORT=<SQLDB포트>
DATABASE_USER=<SQLDB유저아이디>
DATABASE_PASSWORD=<SQLDB비밀번호>
DATABASE_NAME=<SQLDB이름>
MONGODB_URL=<MongoDB URL>
JWT_SECRET=<jwt시크릿키>

// src/config/ 디렉토리 아래에 auth 관련 클래스 정의 및 app.modules.ts 파일에 load 설정 추가
// 예시 src/config/authConfig.ts -> JWT키를 코드에서 사용하기 위한 클래스
import { registerAs } from "@nestjs/config";

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
}));
```

3. DB 연결을 위한 설정
```
// app.modules.ts 설정 추가
// TypeOrmModule -> MySQL 연결
// MongooseModule -> MongoDB 연결
imports: [
        TypeOrmModule.forRoot({
            type: "mysql",
            host: process.env.DATABASE_HOST,
            port: +process.env.DATABASE_PORT,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
        }),
        MongooseModule.forRoot(process.env.MONGODB_URL),
    ],
```

4. Entity 정의 (Repository Pattern)
```
// 4-1. 시간 기준을 (utc+9) 시간으로 변경하기 위해 트랜스포머 생성
// src/transformers/kct.transformer.ts
import { ValueTransformer } from "typeorm";

export class kctTransformer implements ValueTransformer {
    // to() 값을 저장할 때 사용되는 메서드
    to(value: Date): Date {
        return value;
    }

    // from() 값을 호출할때 사용되는 메서드
    from(value: Date | string): Date {
        if (typeof value === "string") {
            value = new Date(value);
        }

        if (value) {
            // UTC+9 시간으로 변환
            value.setHours(value.getHours() + 9);
        }

        return value;
    }
}

// 4-2. user.entity.ts 정의
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ValueTransformer } from "typeorm";
import { kctTransformer } from '../transformers/kct.transformer';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ unique: true })
    userEmail: string;

    @Column({ unique: true })
    userName: string;

    @Column()
    userPassword: string;

    @Column()
    userRating: number;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)', // 마이크로초까지 표현
        transformer: new kctTransformer(),
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        transformer: new kctTransformer(),
    })
    updatedAt: Date;
}
```

5. Guard를 통한 인가(Authorization) 설정
```
// 5-1. 필요 모듈 설치
npm install @nestjs/passport @nestjs/jwt passport-jwt

// 5-2. src/auth/auth.guard.ts 생성
import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import authConfig from 'src/config/authConfig';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: this.config.jwtSecret
                }
            );
            request['user'] = {
                userId: payload.userId,
                userEmail: payload.userEmail,
                userName: payload.userName,
                userPassword: payload.userPassword,
                userRating: payload.userRating,
                createdAt: payload.createdAt,
                updatedAt: payload.updatedAt,
            };
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}

// 5-3. authguard를 실제 API 메소드에 적용
// 적용 샘플 예제
// 유저 조회
@UseGuards(AuthGuard) // 적용하고자 하는 메소드상단에 가드 데코레이터 추가
@Get('info')
async getUserInfo(@Req() req: any): Promise<any> {
    const user = req.user; // 토큰에서 유저 정보가 필요한 경우 req.user를 통해 추출 가능
    return await this.usersService.getUserInfo({userId: user.userId, userEmail: user.userEmail});
}

```

6. 입력 데이터에 대한 유효성 검사 기능 추가
```
// 6-1. class-validator 설치
npm install class-validator class-transformer

// 6-2. DTO 클래스 생성 및 수정
// 예 > src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    // 이메일에 대한 검증 규칙 지정: 값이 공백인지 확인, 이메일 형식인지 확인
    @IsNotEmpty()
    @IsEmail()
    readonly userEmail: string;

    // 유저네임에 대한 검증 규칙 지정: 값이 공백인지 확인, 문자열 형식인지 확인, 길이가 4자 이상 ~ 20자 이하인지 확인
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    readonly userName: string;

    // 패스워드에 대한 검증 규칙 지정: 값이 공백인지 확인
    // 정규표현식 : 최소 8자 이상이어야 하며, 최소 하나의 알파벳이 포함, 최소 하나의 숫자가 포함
    @IsNotEmpty()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message: '비밀번호는 최소 8자 이상이며, 알파벳과 숫자를 포함해야 합니다.',
    })
    readonly userPassword: string;
}

// 6-3. 컨트롤러에서 유효성 검사 적용
// 예 > src/users/users.controller.ts에서 CreateUserDto를 사용하면 사전에 유효성 검증이 진행된 데이터를 통해 데이터를 전달 합니다.
// 회원가입
@Post("signup")
async signUp(
    @Body() createUserDto: CreateUserDto, // dto를 통해 유효성 검증 진행
    @Res() res: any,
): Promise<Object> {
    await this.usersService.signUp(createUserDto);
    return res.status(201).json({
        message: "signed up",
    });
}

// 6-4. src/main.ts 파일에 유효성 검사 파이프라인을 전역적으로 사용하도록 추가
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    //const app = await NestFactory.create(AppModule);
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log(join(__dirname, "../test"));
    app.useStaticAssets(join(__dirname, "../test"));
    app.useGlobalPipes(new ValidationPipe()); // 입력값 유효성 검사를 위한 ValidationPipe 추가
    app.setGlobalPrefix("api");
    await app.listen(3000);
}
bootstrap();
```
