import asyncHandler from "../utils/asyncHandler.js";

const healthCheck = asyncHandler((req, res) => {

    res
        .status(200)
        .json({
            status: "OK",
            message: "Service is up and running"
        })
});

export { healthCheck }