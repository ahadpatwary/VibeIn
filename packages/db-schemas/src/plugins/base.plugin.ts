import { Schema } from 'mongoose';

/**
 * Shared production plugin applied to every schema in this package:
 *  - createdAt / updatedAt timestamps
 *  - soft-delete (deletedAt) with automatic exclusion on find* queries
 *  - a sane, consistent toJSON transform (id instead of _id, no __v, no deletedAt)
 *
 * Apply once per schema: applyBasePlugin(mySchema)
 */
export function applyBasePlugin(schema: Schema): void {
   schema.set('timestamps', true);

   if (!schema.path('deletedAt')) {
      schema.add({ deletedAt: { type: Date, default: null, index: true } });
   }

   schema.set('toJSON', {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
         ret.id = (ret._id as { toString(): string })?.toString();
         delete ret._id;
         delete ret.deletedAt;
         return ret;
      },
   });

   // Exclude soft-deleted documents by default, unless the caller explicitly
   // queries on `deletedAt` themselves (e.g. an admin "show deleted" view).
   schema.pre(
      /^find/,
      function (
         this: {
            getFilter: () => Record<string, unknown>;
            where: (f: Record<string, unknown>) => void;
         },
         next,
      ) {
         const filter = this.getFilter();
         if (filter.deletedAt === undefined) {
            this.where({ deletedAt: null });
         }
         next();
      },
   );
}

/** Marks a document as soft-deleted instead of physically removing it. */
export interface SoftDeletable {
   deletedAt: Date | null;
}
