import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class VerifyToken {
    constructor(private readonly token: any, private readonly secret: string) {
        this.token = token;
        this.secret = secret;
    }

    validateToken() {
        try {
            const payload = jwt.verify(this.token, this.secret);
            return payload;
        } catch (error) {
            return false;
        }
    }
}
