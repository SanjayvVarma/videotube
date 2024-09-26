import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiRespone.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generate tokens')
    }
};

const userRegister = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body;

    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields required")
    }

    const exitUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (exitUser) {
        throw new ApiError(409, "User with email or username  already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;  //log
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; //log

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password,

    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, true, "User registered Successfully")
    )

});

const userLogin = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, 'username or email required')
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, 'user not found')
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, 'invalid user credentials')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, true, "User logged in Successfully")
        )
});

const userLogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, true, 'User logout successfully  ')
        )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.header.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request')
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, 'Invalid refresh token')
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh token expired or used')
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, true, 'access token refreshed')
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid token")
    }

});

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, 'invaild old password')
    }

    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, true, 'Password changed successfully')
        )

});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, true, 'user fetched successfully')
        )
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName && !email) {
        throw new ApiError(400, 'FullName or email required')
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, true, 'Account details updated successfully')
        )
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is missing')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, 'Error while uploading on avatar')
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, true, "Avatar updated successfully")
        )
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, 'Cover image file is missing')
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, 'Error while uploading on cover image')
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, true, "cover image updated successfully")
        )
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username?.trim()) {
        throw new ApiError(400, `username can't find`)
    }

    const channel = await User.aggregate([      // log 
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    if: { $in: [new mongoose.Types.ObjectId(req.user?._id), "$subscribers.subscriber"] },
                    then: true,
                    else: false
                }
            }

        },
        {
            $project: {
                fullName: 1,
                username: 1,
                isSubscribed: 1,
                avatar: 1,
                email: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(400, "channel does not exists")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], true, 'channel fetched successfully')
        )
});

const watchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "onwer",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        avatar: 1,
                                        username: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            onwer: {
                                $first: "$onwer"
                            }
                        }
                    }
                ]
            }
        },

    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, true, "watch history fetched successfuly")
        )
});

export { userRegister, userLogin, userLogout, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, watchHistory }