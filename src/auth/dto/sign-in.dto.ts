import { IsEmail, IsNotEmpty, Matches } from "class-validator";

export class SignInDto {
    // 이메일에 대한 검증 규칙 지정: 값이 공백인지 확인, 이메일 형식인지 확인
    @IsNotEmpty()
    @IsEmail()
    readonly userEmail: string;

    // 패스워드에 대한 검증 규칙 지정: 값이 공백인지 확인
    // 정규표현식 : 최소 8자 이상이어야 하며, 최소 하나의 알파벳이 포함, 최소 하나의 숫자가 포함
    @IsNotEmpty()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message:
            "비밀번호는 최소 8자 이상이며, 알파벳과 숫자를 포함해야 합니다.",
    })
    readonly userPassword: string;
}
