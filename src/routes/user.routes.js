import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, refreshAccessToken, updateAccountDetails, updateUserAvatar, updateUserCoverImage, userLogin, userLogout, userRegister, watchHistory } from "../controllers/user.controller.js";

const router = Router()

const uploadImage = upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
])

router.post("/register", uploadImage, userRegister)

router.post("/login", userLogin)

router.post('/logout', verifyJWT, userLogout)

router.post("/refresh-token", refreshAccessToken)

router.post("/change-password", verifyJWT, changeCurrentPassword)

router.get("/current-user", verifyJWT, getCurrentUser)

router.patch("/update-account", verifyJWT, updateAccountDetails)

router.patch("/update-avatar", verifyJWT, upload.single("avatar"), updateUserAvatar)

router.patch("/update-coverImage", verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.get("/channel/:username", verifyJWT, getUserChannelProfile)

router.get("/watch-history", verifyJWT, watchHistory)

export default router;