import { Inject, Injectable } from "@nestjs/common";
import { CreateFeedPost, UpdateFeedPost } from "./dto/feedPost.dto";
import type { FeedPostPersistenceRepository } from "../domain/repositories/feedPost.persistence.repository.interface";
import { PERSISTENCE_REPOSITORY } from "src/shared/tokens/token";



@Injectable()
export class FeedPostService {

    constructor(
        @Inject(PERSISTENCE_REPOSITORY)
        private readonly persistence: FeedPostPersistenceRepository
    ){}

    async createFeedPost(body: CreateFeedPost) {
        return this.persistence.createFeedPost(body);
    }

    async getFeedPosts() {
        return this.persistence.getFeedPosts();
    }

    
    async updateFeedPost(id: string, body: UpdateFeedPost) {
        return this.persistence.updateFeedPost(id, body);
    }


    async deleteFeedPost(feedPostId: string = "12345" ) {
        return this.persistence.deleteFeedPost(feedPostId);
    }
}