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
