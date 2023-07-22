import { Injectable, Logger } from "@nestjs/common";
import { QuizzesRepository } from "./quizzes.repository";
import { RoomsRepository } from "src/rooms/rooms.repository";

@Injectable()
export class QuizzesService {
    private readonly logger = new Logger(QuizzesService.name);
    constructor(
        private readonly quizzesRepository: QuizzesRepository,
        private readonly roomsRepository: RoomsRepository,
    ) {}

    //정답을 체크한다. 유저가 입력한 message와 answer 정답을 비교 정답이면 true 오답이면 false를 반환한다.
    async checkAnswer(message: string, room: string): Promise<boolean> {
        try {
            const roomInfo = await this.roomsRepository.findOne(room);
            this.logger.verbose(
                `Current answer is ${roomInfo["nowAnswer"]} at room: ${room}`,
            );
            if (message === roomInfo["nowAnswer"]) {
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // 퀴즈 조회 서비스
    async getQuiz(): Promise<any> {
        try {
            // 퀴즈 DB의 총 갯수를 구한다.
            const quizCount = await this.quizzesRepository.getQuizCount();
            //랜덤한 id값을 생성하고 그 id값의 퀴즈를 고른다.
            const randomNum = Math.floor(Math.random() * quizCount) + 1;
            // 퀴즈 DB에서 quizId를 기준으로 퀴즈를 찾는다.
            const newQuiz = await this.quizzesRepository.startQuiz(randomNum);
            return newQuiz;
        } catch (error) {
            this.logger.error(
                `quizzes service, error in quizzes service getQuiz ${error}`,
            );
        }
    }

    updateRoomAnswer(roomId: number, answer: string): Promise<void> {
        try {
            this.roomsRepository.updateRoomAnswer(roomId, answer);
            return;
        } catch (error) {
            this.logger.error(
                `quizzes service, update room answer with error: ${error}`,
            );
        }
    }

    async updateCombo(roomId: number, userId: number) {
        try {
            //룸 아이디와 유저아이디 값으로 콤보를 업데이트한다.
            const comboData = await this.roomsRepository.updateCombo(
                roomId,
                userId,
            );
            console.log("comboData", comboData);

            const comboPoint = [0, 0, 1, 3, 5, 10];
            const comboName = [
                ``, //0
                ``, //1
                `더블 +1`, //2
                `트리플 +3`, //3
                `쿼드라 +5`, //4
                `펜타 +10`, //5
                `전설의 출현 +10`, //6이상
            ];
            //콤보가 6이상이면 전설의 출현이라는 메세지를 보낸다.
            const comboMention =
                comboData["combo"] < 6
                    ? comboName[+comboData["combo"]]
                    : comboName[6];
            //삼항연산자로 할당
            const nowPoint =
                comboData["combo"] < 5 ? comboPoint[+comboData["combo"]] : 10;

            //콤보 점수도 계산해서 object로 반환한다.
            const comboObject = {
                combo: comboData["combo"],
                lastAnswerUserId: comboData["lastAnswerUserId"],
                comboPoint: nowPoint,
                comboMention,
            };
            console.log("comboObject", comboObject);
            return comboObject;
        } catch (error) {
            const comboObject = {
                combo: 2,
                lastAnswerUserId: "",
                comboPoint: 0,
                comboMention: "콤보 에러 발생",
            };
            this.logger.error(
                `quizzes service, updateCombo with error: ${error}`,
            );
            return comboObject;
        }
    }
}
