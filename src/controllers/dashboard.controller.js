import { asyncHandler } from "../utils/asyncHanler";
import { Video } from '../models/video.model'
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const getChannelStats = asyncHandler(async (req, res)=>{
    const userId = req.user._id;

    const totalVideos = await Video.countDocuments({owner: userId})

    if(!totalVideos){
        throw new ApiError(500,
            'Error in finding Total Videos'
        )
    }

    const totalSubscribers = await Subscription.countDocuments({channel: userId})

    if(!totalSubscribers){
        throw new ApiError(500,
            'Error in finding Total Subscribers'
        )
    }

    const totalVideoLikes = await Like.countDocuments({
        video:{
            $in: await Video.find({
                owner: userId
            }).distinct("_id")
        }
    }
    );

    if(!totalVideoLikes){
        throw new ApiError(500,
            'Error in finding Total Video Likes'
        )
    }

    const totalTweetLikes = await Like.countDocuments({
        tweet:{
            $in: await tweet.find({
                owner: userId
            }).distinct("_id")
        }
    }
    );

    if(!totalTweetLikes){
        throw new ApiError(500,
            'Error in finding Total Tweet Likes'
        )
    }

    const totalCommentLikes = await Like.countDocuments({
        tweet:{
            $in: await Comment.find({
                owner: userId
            }).distinct("_id")
        }
    }
    );

    if(!totalCommentLikes){
        throw new ApiError(500,
            'Error in finding Total Comment Likes'
        )
    }

    const totalViews = await Video.aggregate([
        {
            $match:{
                owner: userId
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ]);

    if(!totalViews){
        throw new ApiError(500,
            'Error in finding Total Views'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            {
                totalVideos,
                totalSubscribers,
                totalCommentLikes,
                totalTweetLikes,
                totalVideoLikes,
                totalViews: totalViews[0]?.totalViews || 0
            },
            200,
            "Channel Stats Fetched Succesfully"
        )
    )
    
})

const getChannelVideos = asyncHandler(async (req, res)=>{
    const userId = req.user._id;

    const videos = await Video.find({
        owner: userId
    }).sort(
        {
            createdAt: -1
        }
    );

    if(!videos){
        throw new ApiError(500, 'Error in fetching videos form database')
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            videos,
            200,
            "Channel Video fetched succesfully"
        )
    )
})

export{
    getChannelStats,
    getChannelVideos
}