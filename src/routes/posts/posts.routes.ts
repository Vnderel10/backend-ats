import { Router } from "express";
import PostsController from "../../controllers/posts/posts.controller";
import { uploadSingleImage } from "../../middleware/upload.middleware";

const router = Router();

// ===== CATEGORY ROUTES =====
router.post("/categories", PostsController.createCategory);
router.get("/categories", PostsController.getCategories);
router.get("/categories/:id", PostsController.getCategoryById);
router.put("/categories/:id", PostsController.updateCategory);
router.delete("/categories/:id", PostsController.deleteCategory);

// ===== POST ROUTES =====
router.post("/posts", uploadSingleImage, PostsController.createPost);
router.get("/posts", PostsController.getAllPosts);
router.get("/posts/:id", PostsController.getPostById);
router.put("/posts/:id", uploadSingleImage, PostsController.updatePost);
router.delete("/posts/:id", PostsController.deletePost);

export default router;