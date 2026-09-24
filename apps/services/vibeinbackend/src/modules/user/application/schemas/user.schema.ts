import { z } from 'zod';
import { 
    MAX_EDUCATION_ENTRIES, 
    MAX_SKILL_ENTRIES, 
    MAX_SOCIAL_LINKS, 
    UserRole, 
    UserStatus 
} from '@app/db-schemas';



export const avatarSchema = z
  .object({
    url: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Avatar URL is required';
          }

          return 'Avatar URL must be a string';
        },
      })
      .trim()
      .min(1, 'Avatar URL cannot be empty'),

    public_id: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Avatar public ID is required';
          }

          return 'Avatar public ID must be a string';
        },
      })
      .trim()
      .min(1, 'Avatar public ID cannot be empty'),
  })
  .strict();

/*
|--------------------------------------------------------------------------
| Education Schema
|--------------------------------------------------------------------------
*/

export const educationSchema = z
  .object({
    college: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'College name is required';
          }

          return 'College name must be a string';
        },
      })
      .trim()
      .min(1, 'College name cannot be empty')
      .max(150, 'College name cannot exceed 150 characters'),

    degree: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Degree is required';
          }

          return 'Degree must be a string';
        },
      })
      .trim()
      .min(1, 'Degree cannot be empty')
      .max(100, 'Degree cannot exceed 100 characters'),
  })
  .strict();

/*
|--------------------------------------------------------------------------
| Social Link Schema
|--------------------------------------------------------------------------
*/

export const socialLinkSchema = z
  .object({
    platform: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Social platform is required';
          }

          return 'Social platform must be a string';
        },
      })
      .trim()
      .min(1, 'Social platform cannot be empty')
      .max(30, 'Social platform cannot exceed 30 characters')
      .toLowerCase(),

    url: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Social URL is required';
          }

          return 'Social URL must be a string';
        },
      })
      .trim()
      .min(1, 'Social URL cannot be empty')
      .max(500, 'Social URL cannot exceed 500 characters'),
  })
  .strict();

/*
|--------------------------------------------------------------------------
| Education List
|--------------------------------------------------------------------------
*/

export const educationListSchema = z
  .array(educationSchema, {
    error: (issue) => {
      if (issue.input === undefined) {
        return 'Education must be an array';
      }

      return 'Education must be an array';
    },
  })
  .max(
    MAX_EDUCATION_ENTRIES,
    `You can add a maximum of ${MAX_EDUCATION_ENTRIES} education entries`,
  );

/*
|--------------------------------------------------------------------------
| Skills Schema
|--------------------------------------------------------------------------
*/

export const skillsSchema = z
  .array(
    z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Skill is required';
          }

          return 'Each skill must be a string';
        },
      })
      .trim()
      .min(1, 'Skill cannot be empty'),
    {
      error: (issue) => {
        if (issue.input === undefined) {
          return 'Skills must be an array';
        }

        return 'Skills must be an array';
      },
    },
  )
  .max(
    MAX_SKILL_ENTRIES,
    `You can add a maximum of ${MAX_SKILL_ENTRIES} skills`,
  )
  .superRefine((skills, ctx) => {
    const normalizedSkills = skills.map((skill) =>
      skill.trim().toLowerCase(),
    );

    const uniqueSkills = new Set(normalizedSkills);

    if (uniqueSkills.size !== normalizedSkills.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Skills must be unique',
      });
    }
  });

/*
|--------------------------------------------------------------------------
| Social Links List
|--------------------------------------------------------------------------
*/

export const socialLinksSchema = z
  .array(socialLinkSchema, {
    error: (issue) => {
      if (issue.input === undefined) {
        return 'Social links must be an array';
      }

      return 'Social links must be an array';
    },
  })
  .max(
    MAX_SOCIAL_LINKS,
    `You can add a maximum of ${MAX_SOCIAL_LINKS} social links`,
  )
  .superRefine((links, ctx) => {
    const platforms = links.map((link) =>
      link.platform.trim().toLowerCase(),
    );

    const uniquePlatforms = new Set(platforms);

    if (uniquePlatforms.size !== platforms.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Only one social link is allowed per platform',
      });
    }
  });

/*
|--------------------------------------------------------------------------
| User Roles
|--------------------------------------------------------------------------
*/

const userRoleValues = Object.values(UserRole) as [
  UserRole,
  ...UserRole[],
];

export const userRolesSchema = z
  .array(
    z.enum(userRoleValues, {
      error: (issue) => {
        if (issue.input === undefined) {
          return 'User role is required';
        }

        return `Invalid user role. Allowed roles: ${userRoleValues.join(', ')}`;
      },
    }),
    {
      error: (issue) => {
        if (issue.input === undefined) {
          return 'Roles are required';
        }

        return 'Roles must be an array';
      },
    },
  )
  .min(1, 'User must have at least one role')
  .superRefine((roles, ctx) => {
    if (new Set(roles).size !== roles.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'User roles must be unique',
      });
    }
  });

/*
|--------------------------------------------------------------------------
| User Status
|--------------------------------------------------------------------------
*/

const userStatusValues = Object.values(UserStatus) as [
  UserStatus,
  ...UserStatus[],
];

export const userStatusSchema = z.enum(userStatusValues, {
  error: (issue) => {
    if (issue.input === undefined) {
      return 'User status is required';
    }

    return `Invalid user status. Allowed statuses: ${userStatusValues.join(
      ', ',
    )}`;
  },
});

/*
|--------------------------------------------------------------------------
| Create User Schema
|--------------------------------------------------------------------------
*/

export const createUserSchema = z
  .object({
    fullName: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Full name is required';
          }

          return 'Full name must be a string';
        },
      })
      .trim()
      .min(1, 'Full name cannot be empty')
      .max(60, 'Full name cannot exceed 60 characters')
      .default('< USER >'),

    email: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Email is required';
          }

          return 'Email must be a string';
        },
      })
      .trim()
      .email('Please provide a valid email address')
      .max(254, 'Email cannot exceed 254 characters')
      .toLowerCase(),

    phoneNumber: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Phone number is required';
          }

          return 'Phone number must be a string';
        },
      })
      .trim()
      .min(8, 'Phone number must contain at least 8 characters')
      .max(20, 'Phone number cannot exceed 20 characters'),

    bio: z
      .string({
        error: (issue) => {
          if (issue.input === undefined) {
            return 'Bio is required';
          }

          return 'Bio must be a string';
        },
      })
      .trim()
      .max(500, 'Bio cannot exceed 500 characters')
      .optional(),

    avatar: avatarSchema.nullable().optional(),

    education: educationListSchema.optional(),

    skills: skillsSchema.optional(),

    socialLinks: socialLinksSchema.optional(),

    roles: userRolesSchema.optional(),

    status: userStatusSchema.optional(),
  })
  .strict();

/*
|--------------------------------------------------------------------------
| Update User Schema
|--------------------------------------------------------------------------
|
| PATCH request:
| All fields become optional.
|
*/

export const updateUserSchema = createUserSchema.partial();




export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type AvatarInput = z.infer<typeof avatarSchema>;

export type EducationInput = z.infer<typeof educationSchema>;

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;