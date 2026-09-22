import 'reflect-metadata';
import { container } from 'tsyringe';
import { registerDatabaseModule, MongooseClient } from '@orderbari/mongo-db-core';
import { registerSchemaModule } from '../container/schema.container';
import { UserRepository } from '../user/user.repository';
import { OrderRepository } from '../order/order.repository';
import { OrderStatus } from '../order/order.types';

async function bootstrap() {
  // 1. Register + connect the core DB module (from @orderbari/mongo-db-core)
  registerDatabaseModule({
    config: { uri: process.env.MONGO_URI, dbName: 'orderbari' },
  });
  const client = container.resolve(MongooseClient);
  await client.connect();

  // 2. Bind schemas to the live connection + register repositories
  registerSchemaModule({ connection: client.getConnection() });

  // 3. Use anywhere in the app via DI
  const userRepo = container.resolve(UserRepository);
  const orderRepo = container.resolve(OrderRepository);

  const user = await userRepo.create({ email: 'merchant@orderbari.com', name: 'Abdul' });

  const order = await orderRepo.create({
    merchantId: user.id,
    customerId: 'cust_123',
    items: [{ productId: 'p1', name: 'T-Shirt', quantity: 2, unitPrice: 450 }],
    totalAmount: 900,
    currency: 'BDT',
  });

  await orderRepo.transitionStatus(order.id, OrderStatus.CONFIRMED);
}

bootstrap();
