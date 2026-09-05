import { integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { commits } from "./commit.schema";


export const commitParents = pgTable("commit_parents",{

    commitId: uuid("commit_id")
        .notNull()
        .references(() => commits.id, { onDelete: "cascade" })
    ,

    parentId: uuid("parent_id")
      .notNull()
      .references(() => commits.id, { onDelete: "cascade" }),

    // 0 = first/main parent, 1+ = additional merge parents
    position: integer("position").notNull().default(0),
  },
//   (t) => ({
//     pk: primaryKey({ columns: [t.commitId, t.parentId] }),
//     commitIdx: index("commit_parents_commit_idx").on(t.commitId),
//     parentIdx: index("commit_parents_parent_idx").on(t.parentId),
//   })
);