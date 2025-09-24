import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        console.log('cloud', response);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.log(`Cloudinary Uplaod Error`, error);
        fs.unlinkSync(localFilePath);
    }
}

export const DeleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("src :: utils :: Cloudinary :: DeleteFile", error);
    throw error;
  }
};