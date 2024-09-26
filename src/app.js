import cors from 'cors'
import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";

const app = express()

config({ path: "./.env" })

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(cookieParser())
app.use(express.static("public"))
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// routes

import likeRouter from "./routes/like.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";


app.use("/api/v1/users", userRouter)

app.use("/api/v1/likes", likeRouter)

app.use("/api/v1/tweets", tweetRouter)

app.use("/api/v1/videos", videoRouter)

app.use("/api/v1/comments", commentRouter)

app.use("/api/v1/playlist", playlistRouter)

app.use("/api/v1/dashboard", dashboardRouter)

app.use("/api/v1/healthcheck", healthcheckRouter)

app.use("/api/v1/subscriptions", subscriptionRouter)

export default app;