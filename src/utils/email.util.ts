import { Inject, Injectable } from "@nestjs/common";
import Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';
import emailConfig from "../config/emailConfig";
import { ConfigType } from "@nestjs/config";

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

@Injectable()
export class EmailUtil {
    private transporter: Mail;

    constructor(
        @Inject(emailConfig.KEY) private config: ConfigType<typeof emailConfig>,
    ) {
        this.transporter = nodemailer.createTransport({
            service: config.service,
            auth: {
                user: config.auth.user,
                pass: config.auth.pass,
            },
        });
    }

    async sendUserJoinVerification(
        userEmail: string,
        signupVerifyToken: string,
    ) {
        const baseUrl = this.config.baseUrl;
        const url = `${baseUrl}/api/users/verify?signupVerifyToken=${signupVerifyToken}`;

        const mailOption: EmailOptions = {
            to: userEmail,
            subject: 'playQround 가입 인증 메일',
            html: `
                아래 가입확인 버튼을 누르시면 가입 인증이 완료됩니다.<br/>
                <br/>
                <form action='${url}' method='POST'>
                    <button>가입확인</button>
                </form>
            `,
        };
        return await this.transporter.sendMail(mailOption);
    }
}
