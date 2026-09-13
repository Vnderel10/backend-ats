import { Router } from "express";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../../controllers/posts/posts.controller";
import { uploadSingleImage } from "../../middleware/upload.middleware";

const router = Router();

router.post("/posts", uploadSingleImage, createPost);
router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);
router.put("/posts/:id", uploadSingleImage, updatePost);
router.delete("/posts/:id", deletePost);

export default router;