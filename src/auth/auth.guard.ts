import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import authConfig from "../config/authConfig";
import { ConfigType } from "@nestjs/config";

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
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.config.jwtSecret,
            });
            request["user"] = {
                userId: payload.userId,
                userEmail: payload.userEmail,
                userName: payload.userName,
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
        const tokenRaw =
            request.cookies.authorization ?? request.headers.authorization;
        const [type, token] = tokenRaw ? tokenRaw.split(" ") : [];
        return type === "Bearer" ? token : undefined;
    }
}
