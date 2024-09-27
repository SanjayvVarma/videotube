import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router()

router.use(verifyJWT)

router.post('/create-playlist', createPlaylist)

router.get('/get-playlist/:playlistId', getPlaylistById)

router.get('/all-playlists/:userId', getUserPlaylists)

router.patch('/:playlistId/add-video/:videoId', addVideoToPlaylist)

router.patch('/:playlistId/delete-video/:videoId', removeVideoFromPlaylist)

router.delete('/delete-playlist/:playlistId', deletePlaylist)

router.patch('/update-playlist/:playlistId', updatePlaylist)

export default router;