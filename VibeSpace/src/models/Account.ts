import mongoose, { Schema, Types, Document } from "mongoose";
import bcrypt from "bcryptjs";


export interface IAccount extends Document {
    type: 'credentials' | 'google' | 'github',
    providerId?: string,
    email?: string,
    password?: string,
    authorId: Types.ObjectId,
}

const accountSchema = new Schema<IAccount>({

    type: {
        type: String,
        enum: ["credentials", "google", "github"],
        required: true,
    },

    providerId: {
        type: String,
        trim: true,
        required: function(this: IAccount) {
            return this.type === 'credentials'
        }
    },

    email: {
        type: String,
        trim: true,
        required: function(this: IAccount) {
            return this.type === 'credentials'
        },
        unique: true,
        lowercase: true
    },

    password: {
        type: String, 
        required: function(this: IAccount) {
            return this.type === 'credentials'
        },
    },

    authorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true })

accountSchema.pre("validate", function (next) {
  if (this.type === "credentials" && !this.password) {
    return next(new Error("Password required for credentials"));
  }

  if (this.type !== "credentials" && !this.providerId) {
    return next(new Error("Provider ID required"));
  }

  next();
});


accountSchema.pre<IAccount>("save", async function (next) {
    if (this.isModified("password") && this.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(this.password, salt);
            this.password = hash;
        } catch (err) {
            console.error(err);
            next();
        }
    }
    next();
});

accountSchema.methods.comparePassword = 
    async function ( candidatePassword: string ) {
        if (!this.password) return false;
        return bcrypt.compare(candidatePassword, this.password);
    }
;

const Account = mongoose.models.Account || mongoose.model<IAccount>("Account", accountSchema);
export default Account;