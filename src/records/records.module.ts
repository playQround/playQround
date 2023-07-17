import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RecordsRepository } from "../records/records.repository";
import { Record, RecordSchema } from "../records/schema/records.schema";
import { RecordsService } from "./records.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Record.name, schema: RecordSchema }]),
    ], // entity 사용을 위해 등록 - Mongoose ver.
    controllers: [],
    providers: [RecordsService, RecordsRepository],
    exports: [RecordsRepository],
})
export class RecordsModule {}
