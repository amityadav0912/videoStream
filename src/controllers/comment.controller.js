import { asyncHandler } from "../utils/asyncHanler";
import {Comment} from "../models/comment.model"
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const getVideoComments = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query

    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const comments = await Comment.aggregate(
        [
            {
                $match: {
                    video: videoObjectId
                }
            },
            {
                $lookup:{
                    from: "videos",
                    localField: "video",
                    forignFiend: "_id",
                    as: "CommentOnWhichVideo"
                }
            },
            {
                $lookup:{
                    from: "user",
                    localField: "owner",
                    forignFiend: "_id",
                    as: "OwnerOfComment"
                }
            },
            {
                $project: {
                    content: 1,
                    owner: {
                        $arrayEmenAt: ["$OwnerOfComment", 0]
                    },
                    video: {
                        $arrayEmenAt: ["$CommentOnWhichVideo", 0]
                    },
                    createdAt: 1
                }
            },
            {
                $skip: (page-1) * parseInt(limit)
            },
            {
                $limit: parseInt(limit)
            }
        ]
    );

    if(!comments){
        throw new ApiError(404, "Comments are not Found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            comments,
            200,
            "Comments Fetched Succesfully"
        )
    )
})

const addComment = asyncHandler(async (req, res)=>{
    const {content} = req.body
    const userId = req.user._id;
    const  {videoId} = req.params;

    if(!content){
        throw new ApiError(
            400, 
            'Empty Content Found'
        )
    }

    const addedComment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })

    if(!addedComment){
        throw new ApiError(
            401, 'Something went wrong while adding comment in db'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            addedComment,
            200,
            'Succesfully Added Comment'
        )
    )
})

const updateComment = asyncHandler(async (req, res)=>{
    const {commentId} = req.params;
    const {content} = req.body;

    const userId = req.user._id;

    if(!content){
        throw new ApiError(
            400,
            'Empty Content found'
        )
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: userId
        },
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )

    if(!updatedComment){
        throw new ApiError(500, 'Error in Updating Comment in Database')
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            updatedComment,
            200,
            'Succesfuly Updated Comment'
        )
    )
})

const deleteComment = asyncHandler(async (req, res)=>{
    const commentId = req.params;

    const deleteCommentDoc = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    });

    if(!deleteCommentDoc){
        throw new ApiError(
            500,
            'Error in Deleting Comment'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            deleteCommentDoc,
            200,
            "Succesfully Deleted the Comment"
        )
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}