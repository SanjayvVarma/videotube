import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router()

router.use(verifyJWT)

router.post("/add-comment/:videoId", addComment)

router.patch("/update-comment/:commentId", updateComment)

router.delete("/delete-comment/:commentId", deleteComment)

router.get("/all-comments/:videoId", getVideoComments)

export default router;