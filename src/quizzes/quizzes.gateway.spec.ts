import { Test, TestingModule } from "@nestjs/testing";
import { QuizzesGateway } from "./quizzes.gateway";
import { QuizzesService } from "./quizzes.service";

describe("QuizzesGateway", () => {
    let gateway: QuizzesGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [QuizzesGateway, QuizzesService],
        }).compile();

        gateway = module.get<QuizzesGateway>(QuizzesGateway);
    });

    it("should be defined", () => {
        expect(gateway).toBeDefined();
    });
});
