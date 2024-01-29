import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userSystemEnum = pgEnum("user_system_enum", ["system", "user"]);

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  pdfName: text("pdf_name").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(),
  createdAt: timestamp("created_at", {
    precision: 6,
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    precision: 6,
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .references(() => chats.id)
    .notNull(),
  text: text("content").notNull(),
  createdAt: timestamp("created_at", {
    precision: 6,
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  role: userSystemEnum("role").notNull(),
});

// export const userDocumentsTable = pgTable("user_documents_table", {
//   id: uuid("id").primaryKey(),
//   userId: varchar("user_id"), // You might want to add a length here if there's a limit
//   documentData: text("document_data"),
//   createdAt: timestamp("created_at", {
//     precision: 6,
//     withTimezone: true,
//   }).defaultNow(),
//   updatedAt: timestamp("updated_at", {
//     precision: 6,
//     withTimezone: true,
//   }).default(sql`now()`),
// });
