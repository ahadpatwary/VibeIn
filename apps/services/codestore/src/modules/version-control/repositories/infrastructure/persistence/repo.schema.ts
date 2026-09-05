import { timestamp, varchar, uuid, pgTable, text, pgEnum } from "drizzle-orm/pg-core";

export const visibilityEnum = pgEnum("visibility", ["public", "private"]);

export const repositories = pgTable("repositories", {

    id: uuid("id").primaryKey().defaultRandom(),

    ownerId: varchar("owner_id", { length: 255 }).notNull(),

    name: varchar("name", { length: 100 }).notNull(),

    description: text("description"),
    
    visibility: visibilityEnum("visibility").notNull().default("public"),

    defaultBranch: varchar("default_branch", { length: 255 })
        .notNull()
        .default("main")
    ,
 
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow()
    ,

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .notNull()
        .defaultNow()
    ,

  },
//   (t) => ({
//     // A user can't have two repos with the same name (like GitHub: owner/repo-name)
//     ownerNameUnique: uniqueIndex("repos_owner_name_unique").on(
//       t.ownerId,
//       t.name
//     ),
//     ownerIdx: index("repos_owner_idx").on(t.ownerId),
//   })
);