import { mysqlTable, int, varchar, text, timestamp,} from "drizzle-orm/mysql-core";

export const postsTable = mysqlTable("posts", {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("category_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    imagePublicId: text("image_public_id"),
    status: varchar("status", { length: 20 }).notNull().default("published"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categoriesTable = mysqlTable("categories", {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});