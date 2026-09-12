import { Readable } from "stream";
import cloudinary from "../config/claudinary";

interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
}

// Upload buffer file (dari multer memoryStorage) ke Cloudinary
export const uploadToCloudinary = (
    fileBuffer: Buffer,
    folder: string = "posts"
): Promise<CloudinaryUploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error || !result) {
                    return reject(error);
                }

                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        Readable.from(fileBuffer).pipe(uploadStream);
    });
};

// Hapus gambar dari Cloudinary berdasarkan public_id
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    await cloudinary.uploader.destroy(publicId);
};