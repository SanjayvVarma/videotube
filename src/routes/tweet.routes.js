import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const router = Router()

router.use(verifyJWT)

router.post('/create-tweet', createTweet)

router.get('/get-tweets/:userId', getUserTweets)

router.delete('/delete-tweet/:tweetId', deleteTweet)

router.patch('/update-tweet/:tweetId', updateTweet)


export default router;