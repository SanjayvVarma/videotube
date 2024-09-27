import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const router = Router()

router.use(verifyJWT)

const uploadVideo = upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
])

router.post("/publish-video", uploadVideo, publishAVideo)

router.get('/get-all-videos', getAllVideos)

router.get('/video/:videoId', getVideoById)

router.patch('/update-video/:videoId', upload.single('thumbnail'), updateVideo)

router.delete('/delete-video/:videoId', deleteVideo)

router.patch('/publish-video/:videoId', togglePublishStatus)


export default router;