import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
  DELETED = "DELETED",
}

export enum AccountAuditReason {
  USER_LOGOUT = "USER_LOGOUT",
  LOGOUT_ALL_DEVICE = "LOGOUT_ALL_DEVICE",

  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  EMAIL_CHANGED = "EMAIL_CHANGED",

  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED",
  ACCOUNT_RESTORED = "ACCOUNT_RESTORED",

  ACCOUNT_BANNED = "ACCOUNT_BANNED",
  ACCOUNT_UNBANNED = "ACCOUNT_UNBANNED",

  ACCOUNT_CREATED = "ACCOUNT_CREATED",
  ACCOUNT_DELETED = "ACCOUNT_DELETED",

  TOKEN_REUSE = "TOKEN_REUSE",
  SECURITY_EVENT = "SECURITY_EVENT",

  ADMIN_ACTION = "ADMIN_ACTION",
  SYSTEM_ACTION = "SYSTEM_ACTION",
}

export enum AuditActor {
  USER = "USER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class AccountAuditLog {
    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    })
    userId!: Types.ObjectId;

    @Prop({
        type: String,
        enum: Object.values(AccountStatus),
        required: false,
    })
    previousStatus?: AccountStatus;

    @Prop({
        type: String,
        enum: Object.values(AccountStatus),
        required: true,
    })
    currentStatus!: AccountStatus;

    @Prop({
        type: String,
        enum: Object.values(AccountAuditReason),
        required: true,
    })
    reason!: AccountAuditReason;

    @Prop({
        type: String,
        enum: Object.values(AuditActor),
        required: true,
    })
    actor!: AuditActor;


    @Prop({
        trim: true,
        maxlength: 500,
    })
    description?: string;

    @Prop({
        trim: true,
    })
    ip?: string;

    @Prop({
        trim: true,
    })
    deviceName?: string;

    @Prop({
        trim: true,
    })
    browser?: string;

    @Prop({
        trim: true,
    })
    platform?: string;

    @Prop({
        type: Object,
        default: {},
    })
    metadata?: Record<string, any>;
}

export const AccountAuditLogSchema =
  SchemaFactory.createForClass(AccountAuditLog);