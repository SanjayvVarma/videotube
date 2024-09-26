import ApiError from "../utils/ApiError.js";
import Comment from "../models/comment.model.js";
import ApiResponse from "../utils/ApiRespone.js";
import asyncHandler from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id

    if (!videoId || !content) {
        throw new ApiError(200, 'video and content are required')
    }

    try {
        const comment = await Comment.create({
            content,
            video: videoId,
            onwer: userId
        })

        return res
            .status(201)
            .json(
                new ApiResponse(200, comment, true, 'comment sent')
            )

    } catch (error) {
        throw new ApiError(500, error?.message || 'internal server error')
    }

});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!commentId) {
        throw new ApiError(400, 'commentId not found')
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    if (comment.onwer.toString() !== userId.toString()) {
        throw new ApiError(400, 'your not owner')
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, true, 'comment updated successfully')
        )

});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, 'commentId not found')
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, [], true, 'comment updated successfully')
        )

});

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(400, 'Video ID is required');
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ video: videoId })
        .skip(skip)
        .limit(parseInt(limit))
        .exec();

    const totalComments = await Comment.countDocuments({ video: videoId })

    if (skip >= totalComments && comments.length === 0) {
        throw new ApiError(404, `Page ${page} not found`);
    }

    const resData = {
        totalComments,
        page,
        limit,
        comments
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, resData, true, 'Comments retrieved successfully')
        );
});

export { addComment, updateComment, deleteComment, getVideoComments }