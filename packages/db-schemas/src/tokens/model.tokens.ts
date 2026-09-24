export const MODEL_TOKENS = {
   UserModel: Symbol.for('UserModel'),
   OrderModel: Symbol.for('OrderModel'),
} as const;

export const REPOSITORY_TOKENS = {
   UserRepository: Symbol.for('UserRepository'),
   OrderRepository: Symbol.for('OrderRepository'),
} as const;
