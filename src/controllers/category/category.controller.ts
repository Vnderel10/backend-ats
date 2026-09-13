import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../config/db";
import { categoriesTable } from "../../config/schema";


export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await db.select().from(categoriesTable);

    res.json({
      message: "Berhasil mengambil data kategori",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Nama kategori wajib diisi",
      });
    }

    const result = await db.insert(categoriesTable).values({
      name,
    });

    res.status(201).json({
      message: "Kategori berhasil dibuat",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Nama kategori wajib diisi",
      });
    }

    const categoryId = Number(id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({
        message: "ID kategori tidak valid",
      });
    }

    await db
      .update(categoriesTable)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(categoriesTable.id, categoryId));

    res.json({
      message: "Kategori berhasil diupdate",
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const categoryId = Number(id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({
        message: "ID kategori tidak valid",
      });
    }

    await db
      .delete(categoriesTable)
      .where(eq(categoriesTable.id, categoryId));

    res.json({
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
};