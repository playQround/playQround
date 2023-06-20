1. 필요 모듈 설치
```
npm i --save @nestjs/config // config 패키지
npm i --save @nestjs/typeorm typeorm mysql2 // typeorm 및 mysql 패키지
npm i @nestjs/mongoose mongoose // mongodb 패키지
npm i jsonwebtoken
npm i --save-dev @types/jsonwebtoken // jwt 패키지
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
DATABASE_USERNAME=<SQLDB유저아이디>
DATABASE_PASSWORD=<SQLDB비밀번호>
DATABASE_NAME=<SQLDB이름>
MONGODB_URL=<MongoDB URL>

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