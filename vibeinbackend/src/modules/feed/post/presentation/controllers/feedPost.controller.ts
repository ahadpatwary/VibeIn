import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { FeedPostService } from "../../application/feedPost.service";
import { ZodValidationPipe } from "src/modules/user/application/pipes/zodValidation.pipe";
import { CreateFeedPostBody, createFeedPostDto, updateFeedPostDto } from "../../application/dto/feedPost.dto";

import type { UpdateFeedPost } from "../../application/dto/feedPost.dto";
import { AuthGuard } from "../guards/auth";


@Controller('feed')
@UseGuards(AuthGuard)
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

    @Put(':id')
    @UsePipes(new ZodValidationPipe(updateFeedPostDto))
    updateFeedPost(
        @Body() body: UpdateFeedPost,
        @Param('id') id: string
    ) {
        return this.feedPostService.updateFeedPost(id, body);
    }

    @Delete(':id')
    deleteFeedPost(@Param('id') id: string) {
        return this.feedPostService.deleteFeedPost(id)
    }
}