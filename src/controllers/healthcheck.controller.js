import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHanler";

const healthCheck = asyncHandler(async (req, res)=>{
    try {
        return res
        .status(200)
        .json(
            {status: "OK"},
            200,
            "Service is running smoothly"
        )
    } catch (error) {
        throw new ApiError(500, "Health Check Failed. Something went Wrong here")
    }
})

export {
    healthCheck
}