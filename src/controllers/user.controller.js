import { asyncHandler } from '../utils/asyncHanler.js'
import { uploadFileOnCloudinary } from '../utils/cloudinary.js';

import { User } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import mongoose from 'mongoose';

const generateAccessAndRefreshToken = async(user_id)=>{
    const user = await User.findById(user_id);

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken;
    await user.save({
        validateBeforeSave: false
    })

    return {accessToken, refreshToken}
}

const registerUser = asyncHandler(async (req, res) => {
    // Get user detials
    const { fullName, username, email, password } = req.body;

    let avatarLocalPath;
    if (req.files && req.files.avatar && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }



    let coverImagePath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagePath = req.files.coverImage[0].path;
    }

    if ([fullName, username, email, password].some((value) => value?.trim() === '')) {
        throw new ApiError(
            101,
            'All fields are required'
        )
    }

    if (!avatarLocalPath) {
        throw new ApiError(
            104,
            'Avatar is imp'
        )
    }

    const userExist = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (userExist) {
        throw new ApiError(
            102,
            'User already exists'
        )
    }

    const avatar = await uploadFileOnCloudinary(avatarLocalPath);
    const coverImage = await uploadFileOnCloudinary(coverImagePath);


    if (!avatar) {
        throw new ApiError(
            103,
            'System failed while uploading images'
        )
    }

    const user = await User.create({
        username,
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        password
    })

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res.status(200).json(
        new ApiResponse(200, userCreated, 'User Created Succesfully')
    )

})

const loginUser = asyncHandler(async (req, res)=>{
    console.log('Login User');
    const {username, email, password} = req.body;

    if((!username && !email) || !password){
        throw new ApiError(401, 'All fields are required');
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    });

    if(!user){
        throw new ApiError(402, 'User Not Found');
    }

    const verifyUser = await user.isPasswordCorrect(password);

    if(!verifyUser){
        throw new ApiError(403, 'Invalid Credentials');
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            {
                user: loggedInUser.toObject()
                , accessToken, refreshToken
            },
            "User Logged In Successfully",
            200,
        )
    )
})

const logoutUser = asyncHandler(async (req, res)=>{
    console.log('Logout User');

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {

            },
            "User Logged Out Succesfully"
        )
    )
})

const refreshAccessToken = asyncHandler(async (req, res)=>{
    const receivedAccessToken = req.cookie.refreshToken || req.body.refreshToken;

    if(!receivedAccessToken){
        throw new ApiError(
            401,
            'Invalid Request, Token not received'
        )
    }

    const decodedToken = Jwt.verify(receivedAccessToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);

    if(!user){
        throw new ApiError(
            402,
            'Incorrect Token'
        )
    }
    
    if(receivedAccessToken !== user.refreshToken){
        throw new ApiError(
            403,
            'Incorrect Expired or Used'
        )
    }

    const {accessToken, newRefreshToken} = generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(
            {
                accessToken, refreshToken: newRefreshToken
            },
            200,
            'Refresh Token Updated'
        )
    )
})

const changeCurrentPassword = asyncHandler(async (req, res)=>{
    const {oldPassword, newPassword} = req.body;

    if(!oldPassword || !newPassword){
        throw new ApiError(
            '401',
            'Provide both passwords'
        )
    }

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
         throw new ApiError(
            '402',
            'Old Password Incorrect'
        )
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            'Password Changed Succesfully'
        )
    )
})

const getCurrentUser = asyncHandler(async (req, res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(
            {
                user: req.user
            },
            200,
            'Current User'
        )
    )
})

const updateAccountDetails = asyncHandler(async (req, res)=>{
    const {email, fullName} = req.body;

    if(!email || !fullName){
        throw new ApiError(
            401,
            'All Field are required'
        )
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(
        new ApiResponse(
            {
                user
            },
            200,
            'User Details Updated'
        )
    )
})

const updateUserAvatar = asyncHandler(async (req, res)=>{
    const avatarLocalPath = req.file.path;

    if(!avatarLocalPath){
        throw new ApiError(
            400,
            'Avatar File NOT_FOUND'
        )
    }

    const avatar = await uploadFileOnCloudinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(
            400,
            'Error while uploading avatar on Cloudinary'
        )
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(
            {user},
            200,
            'Avatar Updated Succesfully'
        )
    )
})

const updateUserCoverImage = asyncHandler(async (req, res)=>{
    const coverImageLocalPath = req.file.path;

    if(!coverImageLocalPath){
        throw new ApiError(
            400,
            'CoverImage File NOT_FOUND'
        )
    }

    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);
    if(!coverImage){
        throw new ApiError(
            400,
            'Error while uploading coverImage on Cloudinary'
        )
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(
        new ApiResponse(
            {user},
            200,
            'CoverImage Updated Succesfully'
        )
    )
})

const getUserChannelProfile = asyncHandler(async (req, res)=>{
    const {username} = req.params;

    if(!username.trim()){
        throw new ApiError(
            400,
            'Invalid Username'
        )
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup:{
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo'
            }
        },
        {
            $addFields:{
                subscribersCount: {
                    $size: '$subscribers'
                },
                channelSubscribedToCount: {
                    $size: '$subcribedTo'
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fileName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(
            404,
            'Channel does not exist'
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            channel[0],
            200,
            'User Channel Fetched'
        )
    )
})

const getWatchHistory = asyncHandler(async (req, res)=>{
    const user = await User.aggregate(
        [
            {
                $match:{
                    _id: new mongoose.Schema.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {
                    from: 'videos',
                    localField: 'watchHistory',
                    foreignField: '_id',
                    as: 'watchHistory',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'owner',
                                foreignField: '_id',
                                as: 'owner',
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            fullName: 1,
                                            avatar: 1
                                        }
                                     }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            user[0].watchHistory,
            200,
            'Watch History Fetched Succesfully'
        )
    )
})

export { registerUser , 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};