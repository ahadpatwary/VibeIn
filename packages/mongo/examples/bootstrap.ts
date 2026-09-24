import 'reflect-metadata';
import { registerDatabaseModule } from '../src/container/container';
import { MongooseClient } from '../src/client/mongoose.client';
import { container } from 'tsyringe';
import { UserRepository } from './user.repository';

async function bootstrap() {
   registerDatabaseModule({
      config: {
         uri: process.env.MONGO_URI,
         dbName: 'orderbari',
         maxPoolSize: 20,
      },
   });

   const client = container.resolve(MongooseClient);
   await client.connect();

   const userRepository = container.resolve(UserRepository);
   const user = await userRepository.create({ email: 'test@example.com', name: 'Abdul' });
   console.log(user);

   // Transaction example
   await client.withTransaction(async (session) => {
      await userRepository.create({ email: 'a@x.com', name: 'A' }, session);
      await userRepository.create({ email: 'b@x.com', name: 'B' }, session);
   });
}

bootstrap();
