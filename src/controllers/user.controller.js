import {asyncHandler} from '../utils/asyncHanler.js'

const registerUser = asyncHandler(async (req, res) =>{
    res.status(200).send(
        {
            message: "Api call working"
        }
    )
})

export {registerUser};