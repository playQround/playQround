import { Controller, Get, Inject } from "@nestjs/common";
import { AppService } from "./app.service";
import { ClientKafka, Ctx, KafkaContext, MessagePattern, Payload } from "@nestjs/microservices";

@Controller("api")
export class AppController {
    constructor(
        private readonly appService: AppService,
        @Inject('KAFKA') private readonly kafkaProducer: ClientKafka,
    ) {}

    // @Get()
    // getHello(): string {
    //     return this.appService.getHello();
    // }

    @Get()
    async sendMessage() {
        const message = { value: '카프카 테스트0714' };
        await this.kafkaProducer.emit('kafka2', message);
    }

    @MessagePattern('kafka2')
    readMessage(@Payload() message:  any, @Ctx() context: KafkaContext) {
        const originalMessage = context.getMessage();
        const response = originalMessage.value;

        console.log(originalMessage.value);
        // console.log(message);

        // console.log(context.getTopic());
        // console.log(context.getArgs());
        // console.log(context.getPartition());

        // return response;
    }
}
