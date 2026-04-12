import mongoose, { Schema, Types, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAccount extends Document {
    type: 'credentials' | 'provider',
    email: string,
    password?: string,
    authorId: Types.ObjectId,
}

const accountSchema = new Schema<IAccount>({

    type: {
        type: String,
        enum: ["credentials", "provider"],
        required: true,
    },

    email: { 
        type: String,
        trim: true,
        default: null,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: function (this: IAccount) {
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

    next();
});


accountSchema.pre<IAccount>("save", async function (next) {
    if (this.isModified("password") && this.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (err) {
            return next(err as Error);
        }
    }
    next();
});


accountSchema.methods.comparePassword = async function (candidatePassword: string) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

const Account = mongoose.models.Account || mongoose.model<IAccount>("Account", accountSchema);

export default Account;