import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiRespone.js";
import asyncHandler from "../utils/asyncHandler.js";
import Playlist from "../models/playlists.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const newPlaylist = new Playlist({
        name,
        description,
        owner: req.user._id,
    })

    const savedPlaylist = await newPlaylist.save()

    if (!savedPlaylist) {
        throw new ApiError(500, 'Error creating playlist');
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, savedPlaylist, true, 'savedPlaylist')
        )

});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, 'User ID is required');
    }

    try {
        const playlists = await Playlist.find({ owner: userId });

        if (!playlists) {
            throw new ApiError(400, 'No playlists found for this user')
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, { Playlists: playlists }, true, `Found ${playlists.length} playlists`)
            );
    } catch (error) {
        throw new ApiError(500, error.message || 'Internal Server Error');
    }
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, 'playlistId is required')
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found')
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, true, 'playlist found')
        )

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const userId = req.user?._id;

    if (!playlistId || !videoId) {
        throw new ApiError(400, 'Both video and playlist is required')
    }

    const playlist = await Playlist.findById(playlistId)

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(400, 'your not onwer of the playlist')
    }

    if (!playlist) {
        throw new ApiError(400, 'Playlist not found')
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, 'video already present')
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, true, 'video added in playlist successfully')
        )
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !videoId) {
        throw new ApiError(400, 'both playlistId and videoId are required')
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, 'playlist not found')
    }

    const videoIndex = playlist.videos.indexOf(videoId);
    if (!videoIndex) {
        throw new ApiError(404, 'Video not found in playlist');
    }

    playlist.videos.splice(videoIndex, 1);

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, { Playlist: playlist }, true, 'Video removed successfully')
    );

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const userId = req.user?._id

    if (!playlistId) {
        throw new ApiError(400, 'playlist not found')
    }

    const playlist = await Playlist.findById(playlistId)

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(400, 'your not onwer of the playlist')
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, [], true, 'playlist delete successfully')
        )
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const userId = req.user?._id
    const { name, description } = req.body

    if (!playlistId) {
        throw new ApiError(400, 'playlist not found')
    }

    if (!name && !description) {
        throw new ApiError(400, 'Either name or description are required')
    }

    const playlist = await Playlist.findById(playlistId)

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(400, 'your not onwer of the playlist')
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, { updatedPlaylist: updatedPlaylist }, true, 'playlist updated')
        )
});

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist }