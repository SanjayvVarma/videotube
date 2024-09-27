import Like from "../models/likes.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiRespone.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!videoId) {
        throw new ApiError(404, 'video not found')
    }

    const alreadyLiked = await Like.findOne({ video: videoId, likedBy: userId })

    if (alreadyLiked) {
        await Like.deleteOne({ _id: alreadyLiked._id })
    } else {
        await Like.create({
            video: videoId,
            likedBy: userId
        })
    }

    const likes = await Like.find({ video: videoId }).select('likedBy');

    const likedByUser = likes.map(like => like.likedBy.toString());

    return res
        .status(201)
        .json(
            new ApiResponse(200, { countLikes: likedByUser.length, likeUsers: likedByUser }, true, `${alreadyLiked ? 'Like removed' : 'Like added'}`)
        )

});

const toggleCommentLike = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!commentId) {
        throw new ApiError(400, 'comment not found')
    }

    const alreadyLiked = await Like.findOne({ comment: commentId, likedBy: userId })

    if (!alreadyLiked) {
        await Like.create({
            comment: commentId,
            likedBy: userId
        })
    } else {
        await Like.deleteOne({ _id: alreadyLiked._id })
    }

    const likes = await Like.find({ comment: commentId }).select('likedBy')

    const likeByuser = likes.map((like) => like.likedBy.toString())

    return res
        .status(200)
        .json(
            new ApiResponse(200, { countLike: likes.length, likes: likeByuser }, true, `${alreadyLiked ? 'removed like' : 'like added'}`)
        )

});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user?._id

    if (!tweetId) {
        throw new ApiError(400, 'tweet not found')
    }

    const alreadyLiked = await Like.findOne({ tweet: tweetId, likedBy: userId })

    if (alreadyLiked) {
        await Like.deleteOne({ _id: alreadyLiked._id })
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
    }

    const likes = await Like.find({ tweet: tweetId }).select('likedBy')

    const likeByUser = likes.map((like) => like.likedBy.toString())

    return res
        .status(200)
        .json(
            new ApiResponse(200, { countLike: likeByUser.length, likeUsers: likeByUser }, true, `${alreadyLiked ? 'like removed' : 'like add'}`)
        )

});

const getLikedVideos = asyncHandler(async (req, res) => {

    const userId = req.user?._id;

    const likedVideo = await Like.find({ likedBy: userId, video: { $exists: true } }).select('video').populate('video')

    if (!likedVideo.length) {
        throw new ApiError(400, 'No liked videos found')
    }

    const videos = likedVideo.map((like) => like.video)

    return res
        .status(200)
        .json(
            new ApiResponse(200, { allLikedVideo: likedVideo.length, likedVideos: videos }, true, 'All Liked video fetched')
        )

});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos }