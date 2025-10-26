import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHanler";
import {Playlist} from '../models/playlist.model'
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res)=>{
    const {name, description} = req.body;

    if(!name || !description){
        throw new ApiError(400, 'Input fields are missing')
    };

    const playlist = Playlist.create(
        {
            name,
            description,
            owner: req.user._id
        }
    ) 

    if(!playlist){
        throw new ApiError(
            500,
            'Error in Creating doc for Playlist'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            playlist,
            200,
            'Succesfully Created Playlist'
        )
    )
})

const getUserPlaylist = asyncHandler(async (req, res)=>{
    const userId = req.user._id;

    const userPlaylist = await Playlist.find(
        {
            owner: userId
        }
    )

    if(!userPlaylist){
        throw new ApiError(
            500,
            'No Playlist found'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            userPlaylist,
            200,
            'Succesfully Fetched User Playlist'
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res)=>{
    const {playlistId} = req.params;

    const playListById = await Playlist.findById(playlistId).pupulate("videos")

    if(!playListById){
        throw new ApiError(
            500,
            'No Playlist found'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            playListById,
            200,
            'Succesfully Fetched User Playlist By ID'
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res)=>{
    const {playlistId, videoId} = req.params;

    const playListById = await Playlist.findById(playlistId).pupulate("videos")

    if(!playListById){
        throw new ApiError(
            500,
            'No Playlist found'
        )
    }

    const updatedPlaylist = await Playlist.aggregate([
        {
            $match:{
                _id: new moongoose.Types.ObjectId(playListId),
                owner: req.user._id
            }
        },
        {
            $addFields:{
                videos: {
                    $setUnion: ["$videos", [new mongoose.Types.ObjectId(videoId)]]
                }
            }
        },
        {
            $merge:{
                into: "playlists"
            }
        }
    ])


    if(!updatedPlaylist){
        throw new ApiError(
            404, "Playlist not found"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            updatedPlaylist,
            200,
            'Succesfully Added Video To Playlist'
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res)=>{
    const {playlistId, videoId} = req.params;

    const playListById = await Playlist.findById(playlistId).pupulate("videos")

    if(!playListById){
        throw new ApiError(
            500,
            'No Playlist found'
        )
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        playListById,
        {
            $pull: {
                videos: new mongoose.Types.ObjectId(videoId),
            }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(
            500,
            'Error in Updating Playlist'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            updatedPlaylist,
            200,
            'Succesfully Removed the video from the playlist'
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res)=>{
    const {playListId} = req.params;

    const playListById = await Playlist.findById(playListId).populate("videos")

    if(!playListById){
        throw new ApiError(
            404,
            'No Playlist found'
        )
    }

    const deletededPlaylist = await Playlist.findByIdAndDelete(playListId);

    if(!deletededPlaylist){
        throw new ApiError(
            501,
            'Error in deleting playlist'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            deletededPlaylist,
            200,
            "Succesfully Deleted Playlist"
        )
    )

})

const updatePlalist = asyncHandler(async (req, res)=>{
    const {playListId} = req.params;
    const {name, description} = req.body;

    if(!name || !description){
        throw new ApiError(
            400, 
            'Name and description can not be empty'
        )
    }

    const playListById = await Playlist.findById(playListId).populate("videos")

    if(!playListById){
        throw new ApiError(
            500,
            'No Playlist found'
        )
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playListId,
        {
            $set:{
                name, 
                description
            }
        },
        {
            new: true
        }
    );
    
    if(!updatedPlaylist){
        throw new ApiError(
            500,
            'Error in updating playlist'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            updatedPlaylist,
            200,
            "Succesfully Updated Playlist"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlalist
}