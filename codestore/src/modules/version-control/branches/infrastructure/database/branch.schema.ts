import { timestamp, uuid, varchar,boolean, pgTable } from "drizzle-orm/pg-core";
import { commits } from "src/modules/version-control/commits/infrastructure/persistence/commit.schema";
import { repositories } from "src/modules/version-control/repositories/infrastructure/persistence/repo.schema";



export const branches = pgTable("branches",{

    id: uuid("id").primaryKey().defaultRandom(),

    repositoryId: varchar("repository_id", { length: 255 }).notNull(),

    // HEAD of this branch
    commitId: varchar("commit_id", { length: 255 }).notNull(),
 
    name: varchar("name", { length: 255 }).notNull(),
 
    isProtected: boolean("is_protected").notNull().default(false),
 
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
//     repoNameUnique: uniqueIndex("branches_repo_name_unique").on(
//       t.repositoryId,
//       t.name
//     ),
//     repoIdx: index("branches_repo_idx").on(t.repositoryId),
//     commitIdx: index("branches_commit_idx").on(t.commitId),
//   })
);