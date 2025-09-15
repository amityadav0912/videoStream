import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHanler.js";
import jwt from 'jsonwebtoken'
import {User} from '../models/user.model.js'

export const verifyJWT = asyncHandler( async(req, res, next) =>{
    const token = req.cookies?.accessToken || req.body("Authorization")?.replace("Bearer ", "");

    if(!token){
        throw new ApiError(
            400,
            "Un Authorized Request"
        )
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = User.findById(decodedToken?._id).select("-password -refreshToken");

    if(!user){
        throw new ApiError(
            401,
            'InValid Access Token'
        )
    }

    req.user = user;

    next()
}
)