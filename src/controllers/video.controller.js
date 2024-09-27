import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import Video from "../models/video.model.js";
import ApiResponse from "../utils/ApiRespone.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description } = req.body

    if (!title && !description) {
        throw new ApiError(400, "All field is required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;


    if (!videoFileLocalPath) {
        throw new ApiError(400, 'video file is required')
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = thumbnailLocalPath ? await uploadOnCloudinary(thumbnailLocalPath) : null;


    if (!videoFile) {
        throw new ApiError(400, 'video file is required')
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail?.url || "",
        title,
        description,
        duration: videoFile.duration || 0,
        owner: req.user?._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, true, "Video published successfully")
        )
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit, sortBy = 'createdAt', sortType = 'desc', username } = req.query;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);

    if (currentPage <= 0 || itemsPerPage <= 0) {
        throw new ApiError(404, 'page not found')
    }

    const sortOptions = { [sortBy]: sortType === 'desc' ? -1 : 1 };

    const filter = {};

    if (username) {
        const user = await User.findOne({ username });
        if (!user) {
            throw new ApiError(404, 'User not found')
        }
        filter.owner = user._id;
    }

    const totalVideos = await Video.countDocuments(filter);

    const totalPages = Math.ceil(totalVideos / itemsPerPage);

    if (currentPage > totalPages) {
        throw new ApiError(404, 'page not found')
    }

    const videos = await Video.find(filter)
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .sort(sortOptions)
        .exec();


    return res
        .status(200)
        .json(
            new ApiResponse(200, { videos, totalPages, currentPage, totalVideos }, true, "Videos retrieved successfully")
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, true, 'video found')
        )
});

const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { title, description } = req.body;
    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to update this video');
    }

    const thumbnailLocalPath = req.file?.path

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!title && !description && !thumbnail) {
        throw new ApiError(400, 'At least one field is required to update');
    }

    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                thumbnail: thumbnail?.url,
                description,
            }
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updateVideo) {
        throw new ApiError(404, 'Video not found');
    }

    return res.status(200).json(
        new ApiResponse(200, updateVideo, true, 'Video updated successfully')
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to delete this video');
    }

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, [], true, 'Video deleted successfully')
        )

});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id
    const { isPublished } = req.body

    if (typeof isPublished !== 'boolean') {
        throw new ApiError(400, 'Invalid value for isPublished. It must be a boolean.');
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, 'You are not authorized to publish unpublish this video');
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished
            }
        },
        {
            new: true
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, true, `Video ${isPublished ? 'published' : 'unpublished'} successfully`)
        );

});

export { publishAVideo, getAllVideos, getVideoById, updateVideo, deleteVideo, togglePublishStatus };