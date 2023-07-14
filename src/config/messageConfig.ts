import { registerAs } from "@nestjs/config";

export default registerAs("messageQueue", () => ({
    messageQueue: process.env.REDIS_QUEUE_NAME,
}));
