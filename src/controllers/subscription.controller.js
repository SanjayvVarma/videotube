import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiRespone.js";
import asyncHandler from "../utils/asyncHandler.js";
import Subscription from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;

    if (channelId === userId.toString()) {
        throw new ApiError(403, 'You are not authorized to subscribe');
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    });

    if (existingSubscription) {
        await Subscription.deleteOne({
            subscriber: userId,
            channel: channelId
        });

    } else {
        await Subscription.create({
            subscriber: userId,
            channel: channelId
        });
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channelId, true, `${existingSubscription ? 'Unsubscribed successfully' : 'Subscribed successfully'}`)
        );
});

// controller to return subscriber list of a channel
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const subscriptions = await Subscription.find(
        { subscriber: userId }

    ).populate('channel', 'name');

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscriptions, true, 'Subscribed channels retrieved successfully')
        )
});

// controller to return channel list to which user has subscribed
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, 'Channel ID is required');
    }

    // Find all subscriptions for the given channelId
    const subscriptions = await Subscription.find({ channel: channelId }).populate('subscriber', 'username');


    // Extract and send subscriber details
    const subscribers = subscriptions.map(subscription => subscription.subscriber);

    res.status(200).json(new ApiResponse(200, subscribers, true, 'Subscribers retrieved successfully'));
});


export { toggleSubscription, getSubscribedChannels, getChannelSubscribers };