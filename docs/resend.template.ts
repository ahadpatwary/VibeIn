import { CreateTemplateOptions } from 'resend';

export const EMAIL_TEMPLATES = {
    USER_CREATE: {
        name: 'welcome-email',
        alias: 'welcome-email',
        subject: 'Welcome to Our Platform, {{{NAME}}}!',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Welcome aboard, {{{NAME}}}! 🎉</h2>
                <p>We are super excited to have you with us. Your account is ready to use.</p>
                <p>If you have any questions, feel free to reply to this email.</p>
            </div>
        `,
        variables: [{ key: 'NAME', type: 'string', fallbackValue: 'User' }],
    },

    OTP: {
        name: 'otp-verification',
        alias: 'otp-verification',
        subject: '{{{OTP_CODE}}} is your verification code',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Verification Code</h2>
                <p>Hi {{{NAME}}},</p>
                <p>Your OTP verification code is:</p>
                <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 4px;">{{{OTP_CODE}}}</h1>
                <p>This code will expire in <strong>{{{EXPIRY_MINUTES}}} minutes</strong>. Do not share it with anyone.</p>
            </div>
        `,
        variables: [
            { key: 'NAME', type: 'string', fallbackValue: 'User' },
            { key: 'OTP_CODE', type: 'string', fallbackValue: '000000' },
            { key: 'EXPIRY_MINUTES', type: 'number', fallbackValue: 10 },
        ],
    },

    USER_LOGIN: {
        name: 'login-alert',
        alias: 'login-alert',
        subject: 'Security Alert: New Login to Your Account',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>New Account Login Detected</h2>
                <p>Hi {{{NAME}}},</p>
                <p>We noticed a new login to your account from <strong>{{{DEVICE_INFO}}}</strong> at <strong>{{{LOGIN_TIME}}}</strong>.</p>
                <p>If this was you, you can safely ignore this email. If not, please reset your password immediately.</p>
            </div>
        `,
        variables: [
            { key: 'NAME', type: 'string', fallbackValue: 'User' },
            {
                key: 'DEVICE_INFO',
                type: 'string',
                fallbackValue: 'Unknown Device',
            },
            { key: 'LOGIN_TIME', type: 'string', fallbackValue: 'Recently' },
        ],
    },

    USER_BLOCK: {
        name: 'account-suspended',
        alias: 'account-suspended',
        subject: 'Important: Your Account Has Been Suspended',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #e53e3e;">Account Suspended</h2>
            <p>Hi {{{NAME}}},</p>
            <p>Your account has been temporarily blocked/suspended.</p>
            <p><strong>Reason:</strong> {{{REASON}}}</p>
            <p>If you think this was a mistake, please contact our support team.</p>
        </div>
        `,
        variables: [
            { key: 'NAME', type: 'string', fallbackValue: 'User' },
            {
                key: 'REASON',
                type: 'string',
                fallbackValue: 'Violation of Terms of Service',
            },
        ],
    },

    ORDER_CONFIRMATION: {
        name: 'order-confirmation',
        alias: 'order-confirmation',
        subject: 'Order Confirmation - {{{PRODUCT}}}',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Thank you for your order! 🛒</h2>
                <p>Hi {{{NAME}}},</p>
                <p><strong>Product:</strong> {{{PRODUCT}}}</p>
                <p><strong>Total Paid:</strong> $$$${'{{{PRICE}}}'}</p>
            </div>
        `,
        variables: [
            { key: 'NAME', type: 'string', fallbackValue: 'Customer' },
            { key: 'PRODUCT', type: 'string', fallbackValue: 'Item' },
            { key: 'PRICE', type: 'number', fallbackValue: 0 },
        ],
    },
};
