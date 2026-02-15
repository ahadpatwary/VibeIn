import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMqModule } from './shared/modules/queue/rabbitmq.module';
import { UserModule } from './modules/user/user.module';


const MONGODB_URI='mongodb+srv://ahad_patwary:PB18vuJj2UdQdWXw@cluster0.mjszrdy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/Cards'

@Module({
  imports: [
    MongooseModule.forRoot(MONGODB_URI, {
      retryAttempts: 5,
      retryDelay: 1 * 60 * 1000,
    }),

    RabbitMqModule.forRoot("amqps://dbrcljhf:03DnYhP9lGtrOwhNHHj-yuo4D-KQwytB@shark.rmq.cloudamqp.com/dbrcljhf", {
      retryAttempts: 5,
      retryDelay: 1 * 60 * 1000
    }),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}