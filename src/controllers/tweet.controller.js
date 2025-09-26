import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHanler";
import {Tweet} from '../models/tweet.model'


const createTweet = asyncHandler(async (req, res)=>{
    const {content} = req.body;

    if(!content){
        throw new ApiError(400, 'No content FOUND');
    }

    const tweet = await Tweet.create(
        {
            owner: req.user._id,
            content
        }
    )

    if(!tweet){
        throw new ApiError(401, 'Error creating Tweet Document')
    }

    return res.
    status(200).
    json(
        new ApiResponse(
            tweet,
            200,
            'Succesfully Created a TWEET'
        )
    )
})

const getUserTweets = asyncHandler(async (req, res)=>{
    const user= req.user?._id;

    const userTweets = await Tweet.find({owner: user}).sort(
        {
            createdAt: -1
        }
    );

    if(!userTweets){
        throw new ApiError(
            401, 'Error or No Tweets FOUND'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            userTweets,
            200,
            "Succesfully Fetched User Tweets"
        )
    )
})

const updateTweet = asyncHandler(async (req, res)=>{

    const {tweetId} = req.body;

    const {content} = req.body;

    if(!content){
        throw new ApiError(400, 'No content FOUND');
    }

    const tweet = await Tweet.findById({tweetId, owner: req.user._id});

    if(!tweet){
        throw new ApiError(401, 'Tweet not FOUND');
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        {tweetId, owner:req.user._id},
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )

    if(!tweet){
        throw new ApiError(401, 'ERROR IN UPDATING TWEET');
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            updatedTweet,
            200,
            "Succesfully Updated Tweet"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res)=>{
    const {tweetId} = req.body;

    const userId = req.user._id;

    const DeleteTweet = await Tweet.findByIdAndDelete(
        {tweetId, owner: userId}
    )

    if(!DeleteTweet){
        throw new ApiError(401, 'ERROR IN DELETING TWEET');
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            DeleteTweet,
            200,
            'Succesfullly deleted Tweet'
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}