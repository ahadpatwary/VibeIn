import { CreateFeedPost, UpdateFeedPost } from "../../application/dto/feedPost.dto";



export interface FeedPostPersistenceRepository {
    createFeedPost(body: CreateFeedPost);
    getFeedPosts();
    updateFeedPost(id: string, body: UpdateFeedPost)
    deleteFeedPost(feedpostId: string)
}