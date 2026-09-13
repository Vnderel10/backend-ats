import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { postsTable, categoriesTable } from "../../config/schema";
import { uploadToCloudinary, deleteFromCloudinary } from "../../services/claudinary.service";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await db
      .select({
        id: postsTable.id,
        categoryId: postsTable.categoryId,
        categoryName: categoriesTable.name,
        title: postsTable.title,
        content: postsTable.content,
        imageUrl: postsTable.imageUrl,
        imagePublicId: postsTable.imagePublicId,
        status: postsTable.status,
        createdAt: postsTable.createdAt,
        updatedAt: postsTable.updatedAt,
      })
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id));

    res.json({ message: "Berhasil mengambil data posts", data: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postId = Number(id);

    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: "ID post tidak valid" });
    }

    const posts = await db
      .select({
        id: postsTable.id,
        categoryId: postsTable.categoryId,
        categoryName: categoriesTable.name,
        title: postsTable.title,
        content: postsTable.content,
        imageUrl: postsTable.imageUrl,
        imagePublicId: postsTable.imagePublicId,
        status: postsTable.status,
        createdAt: postsTable.createdAt,
        updatedAt: postsTable.updatedAt,
      })
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(eq(postsTable.id, postId));

    if (posts.length === 0) {
      return res.status(404).json({ message: "Post tidak ditemukan" });
    }

    res.json({ message: "Berhasil mengambil data post", data: posts[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { categoryId, title, content } = req.body;

    if (!categoryId || !title || !content) {
      return res.status(400).json({ message: "categoryId, title, dan content wajib diisi" });
    }

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "posts");
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const result = await db
      .insert(postsTable)
      .values({ categoryId: Number(categoryId), title, content, imageUrl, imagePublicId })
      .$returningId();

    res.status(201).json({ message: "Post berhasil dibuat", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryId, title, content } = req.body;

    if (!categoryId || !title || !content) {
      return res.status(400).json({ message: "categoryId, title, dan content wajib diisi" });
    }

    const postId = Number(id);
    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: "ID post tidak valid" });
    }

    const existing = await db.select().from(postsTable).where(eq(postsTable.id, postId));

    if (existing.length === 0) {
      return res.status(404).json({ message: "Post tidak ditemukan" });
    }

    const oldPost = existing[0];
    let imageUrl = oldPost.imageUrl;
    let imagePublicId = oldPost.imagePublicId;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, "posts");
      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.public_id;

      if (oldPost.imagePublicId) {
        await deleteFromCloudinary(oldPost.imagePublicId);
      }
    }

    await db
      .update(postsTable)
      .set({ categoryId: Number(categoryId), title, content, imageUrl, imagePublicId, updatedAt: new Date() })
      .where(eq(postsTable.id, postId));

    res.json({ message: "Post berhasil diupdate" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const postId = Number(id);

    if (Number.isNaN(postId)) {
      return res.status(400).json({ message: "ID post tidak valid" });
    }

    const posts = await db.select().from(postsTable).where(eq(postsTable.id, postId));

    if (posts.length === 0) {
      return res.status(404).json({ message: "Post tidak ditemukan" });
    }

    const post = posts[0];

    if (post.imagePublicId) {
      await deleteFromCloudinary(post.imagePublicId);
    }

    await db.delete(postsTable).where(eq(postsTable.id, postId));

    res.json({ message: "Post berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};