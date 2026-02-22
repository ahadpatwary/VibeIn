import { CreateFeedPost } from "../../application/dto/feedPost.dto";



export interface FeedPostPersistenceRepository {
    createFeedPost(body: CreateFeedPost);
    getFeedPosts();
}