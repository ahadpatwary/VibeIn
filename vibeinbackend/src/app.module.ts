import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';


const MONGODB_URI='mongodb+srv://ahad_patwary:PB18vuJj2UdQdWXw@cluster0.mjszrdy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/Cards'

@Module({
  imports: [
    MongooseModule.forRoot(MONGODB_URI)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}