import { timestamp, varchar, uuid, pgTable, text } from "drizzle-orm/pg-core";
import { repositories } from "src/modules/version-control/repositories/infrastructure/persistence/repo.schema";
import { trees } from "src/modules/version-control/trees/infrastructure/database/tree.schema";



export const commits = pgTable("commits",{

    id: uuid("id").primaryKey().defaultRandom(),

    repositoryId: uuid("repository_id")
        .notNull()
        .references(() => repositories.id, { onDelete: "cascade" })
    ,
 
    // SHA of this commit object
    sha: varchar("sha", { length: 64 }).notNull(),
 
    // Root tree for this commit's file system snapshot
    treeId: uuid("tree_id")
        .notNull()
        .references(() => trees.id)
    ,
 
    // Committer = person who applied the patch (may differ on rebases/merges)
    committerId: varchar("committer_id", { length: 255 }).notNull(),
 
    message: text("message").notNull(),
 
    createdAt: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow()
    ,

  },
//   (t) => ({
//     repoShaUnique: uniqueIndex("commits_repo_sha_unique").on(
//       t.repositoryId,
//       t.sha
//     ),
//     shaIdx: index("commits_sha_idx").on(t.sha),
//     repoIdx: index("commits_repo_idx").on(t.repositoryId),
//     authorIdx: index("commits_author_idx").on(t.authorId),
//     committedAtIdx: index("commits_committed_at_idx").on(t.committedAt),
//   })
);