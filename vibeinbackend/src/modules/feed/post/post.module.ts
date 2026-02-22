import { Module } from "@nestjs/common";
import { FeedPostService } from "./application/feedPost.service";
import { FeedPost } from "./presentation/controllers/feedPost.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { FeedPostSchema } from "./infrastructure/persistence/schemas/feedPost.schema";
import { PERSISTENCE_REPOSITORY } from "src/shared/tokens/token";
import { MongoFeedPostRepository } from "./infrastructure/persistence/mongo-feedpost.repository";
import { Media, MediaSchema } from "./infrastructure/persistence/schemas/media.schema";



@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FeedPost.name, schema: FeedPostSchema },
            { name: Media.name, schema: MediaSchema }
        ])
    ],
    controllers: [FeedPost],
    providers: [
        FeedPostService,
        { provide: PERSISTENCE_REPOSITORY, useClass: MongoFeedPostRepository }
    ],
    exports: [FeedPostService]
})
export class FeedPostModule {}