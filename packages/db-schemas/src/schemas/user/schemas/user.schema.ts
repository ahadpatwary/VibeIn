import { Connection, Document, HydratedDocument, Model, Schema, Types, model } from 'mongoose';

import type { IAvatar, IEducation, ISocialLink, IUser, UserDocument } from '../types/user.types';

import {
   MAX_EDUCATION_ENTRIES,
   MAX_SKILL_ENTRIES,
   MAX_SOCIAL_LINKS,
   UserRole,
   UserStatus,
} from '../constants/user.constant';

export const AvaterSchema = new Schema<IAvatar>({
   url: {
      type: String,
      required: true,
      trim: true,
   },

   public_id: {
      type: String,
      required: true,
      trim: true,
   },
});

/*
|--------------------------------------------------------------------------
| Education Schema
|--------------------------------------------------------------------------
*/

export const EducationSchema = new Schema<IEducation>(
   {
      college: {
         type: String,
         required: true,
         trim: true,
         maxlength: 150,
      },

      degree: {
         type: String,
         required: true,
         trim: true,
         maxlength: 100,
      },
   },
   {
      _id: false,
      versionKey: false,
   },
);

/*
|--------------------------------------------------------------------------
| Social Link Schema
|--------------------------------------------------------------------------
*/

export const SocialLinkSchema = new Schema<ISocialLink>(
   {
      platform: {
         type: String,
         required: true,
         trim: true,
         lowercase: true,
         maxlength: 30,
      },

      url: {
         type: String,
         required: true,
         trim: true,
         maxlength: 500,
      },
   },
   {
      _id: false,
      versionKey: false,
   },
);

/*
|--------------------------------------------------------------------------
| User Schema
|--------------------------------------------------------------------------
*/

export const UserSchema = new Schema<IUser>(
   {
      fullName: {
         type: String,
         trim: true,

         minlength: 1,
         maxlength: 60,

         default: '< USER >',
      },

      email: {
         type: String,
         required: true,
         unique: true,

         trim: true,
         lowercase: true,

         maxlength: 254,
      },

      phoneNumber: {
         type: String,
         required: true,

         trim: true,

         minlength: 8,
         maxlength: 20,

         /*
          * Hidden from normal queries.
          * Explicitly include:
          * User.findById(id).select('+phoneNumber')
          */
         select: false,
      },

      bio: {
         type: String,
         trim: true,
         maxlength: 500,
      },

      avatar: {
         type: AvaterSchema,
         default: null,
      },

      /*
    |--------------------------------------------------------------------------
    | Education
    |--------------------------------------------------------------------------
    */

      education: {
         type: [EducationSchema],
         default: [],

         validate: {
            validator: function (value: IEducation[]): boolean {
               return value.length <= MAX_EDUCATION_ENTRIES;
            },

            message: `Maximum ${MAX_EDUCATION_ENTRIES} education entries allowed`,
         },
      },

      /*
    |--------------------------------------------------------------------------
    | Skills
    |--------------------------------------------------------------------------
    */

      skills: {
         type: [String],
         default: [],

         validate: {
            validator: function (value: string[]): boolean {
               if (value.length > MAX_SKILL_ENTRIES) {
                  return false;
               }

               /*
                * Prevent duplicate skills.
                */
               const normalized = value.map((skill) => skill.trim().toLowerCase());

               return new Set(normalized).size === normalized.length;
            },

            message: 'Skills must be unique and contain at most 10 entries',
         },
      },

      /*
    |--------------------------------------------------------------------------
    | Social Links
    |--------------------------------------------------------------------------
    */

      socialLinks: {
         type: [SocialLinkSchema],
         default: [],

         validate: {
            validator: function (value: ISocialLink[]): boolean {
               if (value.length > MAX_SOCIAL_LINKS) {
                  return false;
               }

               /*
                * One account per platform.
                *
                * Example:
                * github -> one
                * linkedin -> one
                */
               const platforms = value.map((item) => item.platform.toLowerCase());

               return new Set(platforms).size === platforms.length;
            },

            message: 'Social platforms must be unique and contain at most 7 entries',
         },
      },

      /*
    |--------------------------------------------------------------------------
    | Roles
    |--------------------------------------------------------------------------
    */

      roles: {
         type: [String],
         enum: Object.values(UserRole),

         default: [UserRole.USER],

         validate: {
            validator: function (value: UserRole[]): boolean {
               return value.length > 0 && new Set(value).size === value.length;
            },

            message: 'User must have at least one unique role',
         },
      },

      /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

      status: {
         type: String,
         enum: Object.values(UserStatus),

         default: UserStatus.ACTIVE,

         index: true,
      },
   },

   /*
  |--------------------------------------------------------------------------
  | Schema Options
  |--------------------------------------------------------------------------
  */

   {
      collection: 'users',

      timestamps: true,

      strict: true,

      toJSON: {
         transform: (_doc, ret: Record<string, unknown>) => {
            delete ret.__v;
            delete ret.phoneNumber;

            return ret;
         },
      },
   },
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

/*
 * Global uniqueness.
 *
 * `unique` is an index constraint, not a validator.
 */
UserSchema.index(
   { email: 1 },
   {
      unique: true,
      name: 'users_email_unique',
   },
);

/*
 * Status filtering.
 */
UserSchema.index(
   { status: 1 },
   {
      name: 'users_status_idx',
   },
);

/*
 * Newest users.
 */
UserSchema.index(
   { createdAt: -1 },
   {
      name: 'users_created_at_idx',
   },
);

/*
|--------------------------------------------------------------------------
| Avatar/Public ID Consistency
|--------------------------------------------------------------------------
*/

// UserSchema.pre(
//   'validate',
//   function (next) {
//     const hasAvatar = Boolean(this.avatarUrl);
//     const hasPublicId = Boolean(this.public_id);

//     /*
//      * Both absent -> valid
//      * Both present -> valid
//      */
//     if (hasAvatar === hasPublicId) {
//       return next();
//     }

//     /*
//      * Only avatarUrl exists.
//      */
//     if (hasAvatar) {
//       return next(
//         new Error(
//           'public_id is required when avatarUrl is provided.',
//         ),
//       );
//     }

//     /*
//      * Only public_id exists.
//      */
//     return next(
//       new Error(
//         'avatarUrl is required when public_id is provided.',
//       ),
//     );
//   },
// );
