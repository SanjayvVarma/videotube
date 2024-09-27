import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router()

router.use(verifyJWT)

router.get('/all-liked-video', getLikedVideos)

router.post('/like-video/:videoId', toggleVideoLike)

router.post('/like-tweet/:tweetId', toggleTweetLike)

router.post('/like-comment/:commentId', toggleCommentLike)

export default router;