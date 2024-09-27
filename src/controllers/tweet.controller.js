import ApiError from "../utils/ApiError.js";
import Tweet from "../models/tweet.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiRespone.js";

const createTweet = asyncHandler(async (req, res) => {

    const { content } = req.body;
    const userId = req.user?._id;

    if (!content) {
        throw new ApiError(400, 'content is required')
    }

    const tweet = await Tweet.create({
        owner: userId,
        content
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201, tweet, true, 'Tweet created successfully')
        )

});

const getUserTweets = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, 'Invalid user')
    }

    const tweets = await Tweet.find({ owner: userId })

    if (!tweets.length) {
        throw new ApiError(400, 'No tweets found for this user')
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { countTweets: tweets.length, tweets }, true, 'all tweets fetched')
        )

});

const updateTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!tweetId || !content) {
        throw new ApiError(400, 'TweetId and content are required')
    }

    const tweet = await Tweet.findById(tweetId)

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(400, 'you are author')
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content
        },
        {
            new: true
        }
    )

    if (!updatedTweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { newContent: updatedTweet }, true, 'tweet updated successfully')
        )

});

const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!tweetId) {
        throw new ApiError(400, 'TweetId is required')
    }

    const tweet = await Tweet.findById(tweetId)

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(400, 'you are author')
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, true, 'tweet deleted successfully')
        )

});

export { createTweet, getUserTweets, updateTweet, deleteTweet }