import { Router } from "express";
import {
    deleteVideo,
    getAllVideo,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo
} from "../controllers/video.controller"

import { verifyJWT } from "../middlewares/auth.middleware";
import {upload} from "../middlewares/multer.middleware"

const router = Router();

router.use(verifyJWT);

router.route("/")
    .get(getAllVideo)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishAVideo
    )

router.route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail", updateVideo))

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
