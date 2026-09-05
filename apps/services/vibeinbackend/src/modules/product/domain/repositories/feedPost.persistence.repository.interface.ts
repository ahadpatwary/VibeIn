import { CreateProductType, UpdateFeedPost } from "../../application/dto/feedPost.dto";



export interface FeedPostPersistenceRepository {
    createFeedPost(body: CreateProductType);
    getFeedPosts();
    updateFeedPost(id: string, body: UpdateFeedPost)
    deleteFeedPost(feedpostId: string)
}