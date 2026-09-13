import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { categoriesTable } from "../../config/schema";

// ===== GET ALL CATEGORIES =====
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await db.select().from(categoriesTable);
    res.json({ message: "Berhasil mengambil data kategori", data: categories });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ===== GET CATEGORY BY ID =====
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoryId = Number(id);

    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ message: "ID kategori tidak valid" });
    }

    const categories = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, categoryId));

    if (categories.length === 0) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.json({ message: "Berhasil mengambil data kategori", data: categories[0] });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ===== CREATE CATEGORY =====
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const result = await db.insert(categoriesTable).values({ name });

    res.status(201).json({ message: "Kategori berhasil dibuat", data: result });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ===== UPDATE CATEGORY =====
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    const categoryId = Number(id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ message: "ID kategori tidak valid" });
    }

    await db
      .update(categoriesTable)
      .set({ name, updatedAt: new Date() })
      .where(eq(categoriesTable.id, categoryId));

    res.json({ message: "Kategori berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ===== DELETE CATEGORY =====
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const categoryId = Number(id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({ message: "ID kategori tidak valid" });
    }

    await db.delete(categoriesTable).where(eq(categoriesTable.id, categoryId));

    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};