import {asyncHandler} from '../utils/asyncHanler.js'
import { uploadFileOnCloudinary } from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res) =>{
    // Get user detials

    const {fullName, username ,email, password} = req.body;
    const avatarLocalPath = req.files.avatar[0].path;
    const coverImagePath = req.files.coverImage[0].path;

    if(!avatarLocalPath || !coverImagePath ||[fullName, username, email, password].some((value)=> value?.trim()==='')){
        return new ApiError(
            stausCode = 101,
            message= 'All fields are required'
        )
    }

    const userExist = User.findOne({
        $or: [{email}, {username}]
    })

    if(userExist){
        return new ApiError(
            stausCode = 102,
            message= 'User already exists'
        )
    }

    const avatar = uploadFileOnCloudinary(avatarLocalPath);
    const coverImage = uploadFileOnCloudinary(coverImagePath);


    if(!avatar || !coverImage){
        return new ApiError(
            stausCode = 102,
            message= 'System failed while uploading images'
        )
    }

    const user = User.create({
        username,
        email,
        fullName,
        avatar,
        coverImage,
        password
    })

    const userCreated = User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res.status(200).json(
        new ApiResponse(200, userCreated, 'User Created Succesfully')
    )

})

export {registerUser};