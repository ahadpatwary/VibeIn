import { Body, Controller, Get, HttpCode, HttpStatus, Post, UsePipes } from "@nestjs/common";
import { FeedPostService } from "../../application/feedPost.service";
import { ZodValidationPipe } from "src/modules/user/application/pipes/zodValidation.pipe";
import { CreateFeedPostBody, createFeedPostDto } from "../../application/dto/feedPost.dto";


@Controller('feed')
export class FeedPost {

    constructor(private readonly feedPostService: FeedPostService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(createFeedPostDto))
    createFeedPost(@Body() body: CreateFeedPostBody) {
        return this.feedPostService.createFeedPost(body);
    }

    @Get()
    getFeedPosts() {
        return this.feedPostService.getFeedPosts();
    }
}