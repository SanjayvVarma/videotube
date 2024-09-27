import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()

router.use(verifyJWT);

router.post('/channel/:channelId', toggleSubscription)

router.get('/subscribed-channel', getSubscribedChannels)

router.get("/subscribers/:channelId", getChannelSubscribers);

export default router;