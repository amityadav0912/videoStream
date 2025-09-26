import { asyncHandler } from "../utils/asyncHanler";
import {Subsription} from '../models/subscription.model'
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

const toggleSubscription = asyncHandler(async (req, res)=>{
    const {channelId} = req.params;

    const subscriberId = req.user._id;

    const alreadySubscribed = await Subsription.find(
        {
            subscriber: subscriberId,
            channel: channelId
        }
    )

    if(alreadySubscribed){
        await Subsription.findByIdAndDelete(alreadySubscribed._id);

        return res
        .status(200)
        .json(
            new ApiResponse(
                alreadySubscribed,
                200,
                'Succesfully Un-Subscribed the channel'
            )
        )
    }

    const subscribeNow = await Subsription.create(
        {
            subscriber: subscriberId,
            channel: channelId
        }
    )

    if(!subscribeNow){
        throw new ApiError(
            500,
            'Error in Subscribing Channel'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            subscribeNow,
            200,
            'Succesfully Subscribed the Channel'
        )
    )
})

const getUserChannelSubscribers = asyncHandler(async (req, res)=>{
    const {channelId} = req.params;

    const subscribers = await Subsription.find(
        {
          channel: channelId
        }
    ).populate("subscriber", "_id name email")

    if(!subscribers){
        throw new ApiError(
            500,
            'Error in fetching the subscriber Docs'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            subscribers,
            200,
            'Succesfully fetched Subscribers'
        )
    )
})

const getSubscribedChannels = asyncHandler(async (req, res)=>{
    const {subscriberId} = req.params;

    const subscribedChannels = await Subsription.find(
        {
            subscriber: subscriberId
        }
    ).populate("channel", "_id name email")

    if(!subscribedChannels){
        throw new ApiError(
            500,
            'Erro in fetching subcribed channels'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            subscribedChannels,
            200,
            'Succesfully fetched subscribed channels list'
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}