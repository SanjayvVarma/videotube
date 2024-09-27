import Like from "../models/likes.model.js";
import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import Subscription from "../models/subscription.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const totalViews = await Video.aggregate([
        { $match: { channelId: userId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    const totalSubscribers = await Subscription.countDocuments({ channelId: userId })

    const totalVideos = await Video.countDocuments({ channelId: userId })

    const totalLikes = await Like.countDocuments({ videoId: { $in: await Video.find({ channelId: userId }).distinct('_id') } });

    const stats = {
        totalViews: totalViews[0]?.totalViews || 0,
        totalSubscribers,
        totalVideos,
        totalLikes,
    };

    res.status(200).json(stats);

});

const getChannelVideos = asyncHandler(async (req, res) => {

});

export { getChannelStats, getChannelVideos }