import { container } from 'tsyringe';

import { MongooseClient } from '../src/client/mongoose.client';
import { registerDatabaseModule } from '../src/container/container';

async function bootstrap() {
   registerDatabaseModule(container, {
      uri: 'mongo:uri',
      connOption: {
         dbName: 'dbname',
         maxPoolSize: 10,
         minPoolSize: 2,
      },
   });

   const client = container.resolve(MongooseClient);
   await client.connect('mongo/uri');
}

bootstrap();
