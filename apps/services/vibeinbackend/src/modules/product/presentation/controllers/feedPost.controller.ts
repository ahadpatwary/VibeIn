import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { FeedPostService } from "../../application/feedPost.service";
import { ZodValidationPipe } from "src/modules/user/application/pipes/zodValidation.pipe";
import { createProductDto, updateFeedPostDto } from "../../application/dto/feedPost.dto";

import type { CreateProductType, UpdateFeedPost } from "../../application/dto/feedPost.dto";
import { AuthGuard } from "../guards/auth";


@Controller('product')
@UseGuards(AuthGuard)
export class FeedPost {

    constructor(private readonly productService: FeedPostService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(createProductDto))
    createFeedPost(@Body() body: CreateProductType) {
        return this.productService.createFeedPost(body);
    }

    @Get()
    getFeedPosts() {
        return this.productService.getFeedPosts();
    }

    @Put(':id')
    @UsePipes(new ZodValidationPipe(updateFeedPostDto))
    updateFeedPost(
        @Body() body: UpdateFeedPost,
        @Param('id') id: string
    ) {
        return this.productService.updateFeedPost(id, body);
    }

    @Delete(':id')
    deleteFeedPost(@Param('id') id: string) {
        return this.productService.deleteFeedPost(id)
    }
}