import 'reflect-metadata';
import { container as rootContainer, DependencyContainer } from 'tsyringe';
import { Connection } from 'mongoose';
import { MODEL_TOKENS } from '../tokens/model.tokens';
import { createUserModel } from '../user/user.schema';
import { createOrderModel } from '../order/order.schema';
import { UserRepository } from '../user/user.repository';
import { OrderRepository } from '../order/order.repository';

export interface RegisterSchemaModuleOptions {
  /** An established mongoose Connection — get this from MongooseClient.getConnection() after client.connect(). */
  connection: Connection;
  /** Optional tsyringe child container. Defaults to the root container. */
  childContainer?: DependencyContainer;
}

/**
 * Binds every schema in this package to the given connection and registers
 * the resulting models + repositories into the tsyringe container.
 *
 * Call this once, right after MongooseClient.connect() succeeds:
 *
 *   const client = container.resolve(MongooseClient);
 *   await client.connect();
 *   registerSchemaModule({ connection: client.getConnection() });
 *
 *   const userRepo = container.resolve(UserRepository);
 */
export function registerSchemaModule(options: RegisterSchemaModuleOptions): DependencyContainer {
  const target = options.childContainer ?? rootContainer;
  const { connection } = options;

  target.register(MODEL_TOKENS.UserModel, { useValue: createUserModel(connection) });
  target.register(MODEL_TOKENS.OrderModel, { useValue: createOrderModel(connection) });

  target.registerSingleton(UserRepository);
  target.registerSingleton(OrderRepository);

  return target;
}
