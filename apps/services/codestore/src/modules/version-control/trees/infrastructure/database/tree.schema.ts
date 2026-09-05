import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";



export const trees = pgTable('trees', {
    id: uuid('id').primaryKey().defaultRandom(),

    repositoryId: varchar('repository_id', { length: 255 }).notNull(),

    branchName: varchar('branch_name', { length: 255 }).notNull(),

    hash: varchar('hash', { length: 255 }).notNull().unique(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
})