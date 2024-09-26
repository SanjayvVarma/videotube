import { v2 as cloudinary } from "cloudinary";

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};


const getPublicIdFromUrl = (url) => {
    const matches = url.match(/\/([^\/]+)\.(jpg|png|jpeg|gif)/);
    return matches ? matches[1] : null;
};

export { deleteFromCloudinary, getPublicIdFromUrl }
