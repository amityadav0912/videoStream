import { ApiError , ApiResponse} from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHanler";
import { uploadFileOnCloudinary } from "../utils/cloudinary";
import { Video } from "../models/video.model";

const getAllVideo = asyncHandler(async (req, res)=>{
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // let filter = {};

    // if(query){
    //     filter.$or = [
    //         { title: { $regex: query, $options: "i" } },
    //         { description: { $regex: query, $options: "i" } },
    //         ];
    // }

    // if(userId){
    //     filter.user = userId;
    // }

    const sortOrder = sortBy === 'asc' ? 1 : -1;

    const sortOptions= {
        [sortBy] : sortOrder
    };

    // const skip = (page - 1) * limit;

    // const allVideos = await Video.find(filter)
    // .sort(sortOptions)
    // .skip(skip)
    // .limit(Number(limit))

    // const totalVideoCount = await Video.countDocuments(filter);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: sortOptions,

    }

    const allVideos = await Video.aggregatePaginate(
        [
            {
                $match: {
                    isPublished: true
                }
            }
        ],
        options
    )

    if(!allVideos){
        throw new ApiError(
            500,
            'Error Fetching all videos'
        )
    }

    return res
    .status(200)
    .json(
        ApiResponse(
        {
            videos: allVideos,
            pagination: {
                total: totalVideoCount,
                page: Number(page),
                limit: Number(limit),
                //totalPages: Math.ceil(totalVideoCount/limit)
            }
        },
        200,
        'Succesfully retured all videos'
       )
    )
    
})

const publishAVideo = asyncHandler(async (req, res)=>{
    const { title, description} = req.body;

    if(!title || !description){
        throw new ApiError(
            400,
            'Please provide Title and description'
        )
    }

    const videoLocalPath = req.file.path;

    if(!videoLocalPath){
        throw new ApiError(
            401,
            'videoLocalPath Not found'
        )
    }

    const video = uploadFileOnCloudinary(videoLocalPath);

    if(!video){
        throw new ApiError(
            500,
            'Error in uploading video to cloudinary'
        )
    }

    const publishVideo = await Video.create(
        {
            videoFile: video.url,
            thumbnail: video.thumbnail,
            owner: req.user._id,
            title,
            description,
            duration: video.duration,
        }
    )

    if(!publishVideo){
        throw new ApiError(
            501,
            'Error in Creating Database document'
        )
    }

    return res
    .status(200)
    .json(
        ApiResponse(
            publishVideo,
            200,
            'Succesfully Published the video'
        )
    )
}
)

const getVideoById = asyncHandler(async (req, res)=>{
    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(
            400,
            'Error accessing VideoId'
        )
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(
            401,
            'Error finding video in database'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            {video},
            200,
            'Succesfully Fetched Video by its ID'
        )
    )
})

const updateVideo = asyncHandler(async (req, res)=>{

})

const deleteVideo = asyncHandler(async (req, res)=>{
    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(
            400,
            'Error accessing VideoId'
        )
    }

    await Video.deleteVideo(videoId);

    return res
    .status(200)
    .json(
        200,
        'Video Deleted Succesfully'
    )
})

const togglePublishStatus = asyncHandler(async (req, res)=>{
    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(
            400,
            'Error accessing VideoId'
        )
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !isPublished
            }
        },
        {
            new: true
        }
    )
})

export {
    getAllVideo,
    publishAVideo,
    getVideoById
}