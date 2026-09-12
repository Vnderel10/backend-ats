import { Request, Response } from 'express';
import { db } from '../../config/db';
import * as schema from '../../config/schema';
import cloudinary from '../../config/claudinary';
import { eq } from 'drizzle-orm';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

// Helper kecil biar upload logic-nya nggak diduplikasi di create & update
function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error: any, result: any) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload gagal, tidak ada hasil dari Cloudinary'));
        resolve(result as CloudinaryUploadResult);
      }
    );
    stream.end(buffer);
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
}

export class PostsController {
  // 1. CREATE POST
  static async createPost(req: Request, res: Response) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      const { title, content, userId } = req.body;

      // Validasi input wajib
      if (!title || !content) {
        return res.status(400).json({ message: 'title dan content wajib diisi' });
      }

      // Idealnya userId diambil dari req.user (hasil auth middleware),
      // bukan dari body — supaya user tidak bisa mengaku jadi user lain.
      const parsedUserId = Number(userId);
      if (!userId || Number.isNaN(parsedUserId)) {
        return res.status(400).json({ message: 'userId tidak valid' });
      }

      let imageUrl: string | null = null;
      let imagePublicId: string | null = null;

      if (file) {
        if (!file.buffer) {
          return res.status(400).json({
            message: 'File buffer tidak ditemukan. Pastikan multer menggunakan memoryStorage()',
          });
        }
        const uploadResult = await uploadToCloudinary(file.buffer, 'posts');
        imageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      }

      const insertResult = await db
        .insert(schema.postsTable)
        .values({
          userId: parsedUserId,
          title,
          content,
          imageUrl,
          imagePublicId,
        })
        .$returningId();

      return res.status(201).json({
        message: 'Post berhasil dibuat',
        data: { id: insertResult[0]?.id, title, content, imageUrl },
      });
    } catch (error: unknown) {
      return res.status(500).json({ message: getErrorMessage(error) });
    }
  }

  // 2. GET ALL POSTS
  static async getAllPosts(req: Request, res: Response) {
    try {
      const allPosts = await db.select().from(schema.postsTable);
      return res.status(200).json({
        message: 'Berhasil mengambil semua post',
        data: allPosts,
      });
    } catch (error: unknown) {
      return res.status(500).json({ message: getErrorMessage(error) });
    }
  }

  // 3. GET POST BY ID
  static async getPostById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = Number(id);
      if (Number.isNaN(numericId)) {
        return res.status(400).json({ message: 'id tidak valid' });
      }

      const result = await db
        .select()
        .from(schema.postsTable)
        .where(eq(schema.postsTable.id, numericId));

      if (result.length === 0) {
        return res.status(404).json({ message: 'Post tidak ditemukan' });
      }

      return res.status(200).json({
        message: 'Berhasil mengambil data post',
        data: result[0],
      });
    } catch (error: unknown) {
      return res.status(500).json({ message: getErrorMessage(error) });
    }
  }

  // 4. UPDATE POST
  static async updatePost(req: Request, res: Response) {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      const { id } = req.params;
      const { title, content } = req.body;

      const numericId = Number(id);
      if (Number.isNaN(numericId)) {
        return res.status(400).json({ message: 'id tidak valid' });
      }

      const existingPost = await db
        .select()
        .from(schema.postsTable)
        .where(eq(schema.postsTable.id, numericId));

      if (existingPost.length === 0) {
        return res.status(404).json({ message: 'Post tidak ditemukan' });
      }

      const updateData: Record<string, any> = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;

      if (file) {
        if (!file.buffer) {
          return res.status(400).json({ message: 'File buffer tidak ditemukan.' });
        }
        const uploadResult = await uploadToCloudinary(file.buffer, 'posts');
        updateData.imageUrl = uploadResult.secure_url;
        updateData.imagePublicId = uploadResult.public_id;

        // Hapus gambar lama di Cloudinary supaya tidak jadi sampah,
        // sekarang bisa karena imagePublicId sudah disimpan di schema.
        const oldPublicId = existingPost[0].imagePublicId;
        if (oldPublicId) {
          try {
            await cloudinary.uploader.destroy(oldPublicId);
          } catch {
            // Gagal hapus gambar lama tidak seharusnya menggagalkan update post
          }
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
      }

      await db.update(schema.postsTable).set(updateData).where(eq(schema.postsTable.id, numericId));

      return res.status(200).json({
        message: 'Post berhasil diperbarui',
      });
    } catch (error: unknown) {
      return res.status(500).json({ message: getErrorMessage(error) });
    }
  }

  // 5. DELETE POST
  static async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const numericId = Number(id);
      if (Number.isNaN(numericId)) {
        return res.status(400).json({ message: 'id tidak valid' });
      }

      const existingPost = await db
        .select()
        .from(schema.postsTable)
        .where(eq(schema.postsTable.id, numericId));

      if (existingPost.length === 0) {
        return res.status(404).json({ message: 'Post tidak ditemukan' });
      }

      // Hapus juga gambar di Cloudinary kalau ada
      const publicId = existingPost[0].imagePublicId;
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch {
          // Gagal hapus gambar tidak seharusnya menggagalkan hapus post
        }
      }

      await db.delete(schema.postsTable).where(eq(schema.postsTable.id, numericId));

      return res.status(200).json({
        message: 'Post berhasil dihapus',
      });
    } catch (error: unknown) {
      return res.status(500).json({ message: getErrorMessage(error) });
    }
  }
}

export default PostsController;