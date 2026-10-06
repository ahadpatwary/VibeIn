import type { IUser } from '@app/contracts';
import { Schema } from 'mongoose';

import {
   DEFAULT_USER_NAME,
   MAX_EDUCATION_ENTRIES,
   MAX_SKILL_ENTRIES,
   MAX_SOCIAL_LINKS,
   UserRole,
   UserStatus,
} from '../constants/user.constant';

export const AvaterSchema = new Schema<IUser['avatar']>({
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

export const EducationSchema = new Schema<IUser['education']>(
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

export const SocialLinkSchema = new Schema<IUser['socialLinks']>(
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

         default: DEFAULT_USER_NAME,
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
      },

      /*
    |--------------------------------------------------------------------------
    | Education
    |--------------------------------------------------------------------------
    */

      education: {
         type: [EducationSchema],

         validate: {
            validator: function (value: IUser['education']): boolean {
               return !value || value.length <= MAX_EDUCATION_ENTRIES;
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

         validate: {
            validator: function (value: IUser['skills']): boolean {
               if (!value) return true;

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

         validate: {
            validator: function (value: IUser['socialLinks']): boolean {
               if (!value) return true;

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
         type: String,
         default: UserRole.USER,
         enum: Object.values(UserRole),
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
