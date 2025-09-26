import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHanler";
import {Like} from '../models/like.model'
import { use } from "react";

const toggleVideoLike = asyncHandler(async (req, res)=>{
    const {videoId} = req.body;

    const userId = req.user._id;
    
    if(!videoId){
        throw new ApiError(400, 'Video ID NOT_FOUND');
    }

    const existingLike = await Like.findOne(
        {
            video: videoId,
            likedBy: userId
        }
    )

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id);

        return res
        .status(200)
        .json(
            new ApiResponse(
                existingLike, 200, "Video UnLiked Succesfullly"
            )
        )
    }

    const LikeVideo = await Like.create(
        {
            video: videoId,
            likedBy: userId
        }
    )

     return res
        .status(200)
        .json(
            new ApiResponse(
                LikeVideo, 200, "Video Liked Succesfullly"
            )
    )

})

const toggleCommentLike = asyncHandler(async (req, res)=>{
    const {commentId} = req.body;

    const userId = req.user._id;
    
    if(!commentId){
        throw new ApiError(400, 'comment ID NOT_FOUND');
    }

    const existingComment = await Like.findOne(
        {
            comment: commentId,
            likedBy: userId
        }
    )

    if(existingComment){
        await Like.findByIdAndDelete(existingComment._id);

        return res
        .status(200)
        .json(
            new ApiResponse(
                existingComment, 200, "Comment UnLiked Succesfullly"
            )
        )
    }

    const LikeComment = await Like.create(
        {
            comment: commentId,
            likedBy: userId
        }
    )

     return res
        .status(200)
        .json(
            new ApiResponse(
                LikeComment, 200, "Comment Liked Succesfullly"
            )
    )

})

const toggleTweetLike = asyncHandler(async (req, res)=>{
    const {tweetID} = req.body;

    const userId = req.user._id;
    
    if(!tweetID){
        throw new ApiError(400, 'tweet ID NOT_FOUND');
    }

    const existingTweet = await Like.findOne(
        {
            tweet: tweetID,
            likedBy: userId
        }
    )

    if(existingTweet){
        await Like.findByIdAndDelete(existingTweet._id);

        return res
        .status(200)
        .json(
            new ApiResponse(
                existingTweet, 200, "Tweet UnLiked Succesfullly"
            )
        )
    }

    const LikeTweet = await Like.create(
        {
            tweet: tweetID,
            likedBy: userId
        }
    )

     return res
        .status(200)
        .json(
            new ApiResponse(
                LikeTweet, 200, "Tweet Liked Succesfullly"
            )
    )
})

const getLikedVideos = asyncHandler(async (req, res)=>{
    const userId = req.user._id;


    const likedVideos = await Like.find({
        likedBy: userId,
        video: {
            $exists: true
        }
    }).populate("video", "_id title url");

    return res
    .status(200)
    .json(
        new ApiResponse(
            likedVideos,
            200,
            "Liked Videos Fetched Succesfully"
        )
    )
})


export {toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos}