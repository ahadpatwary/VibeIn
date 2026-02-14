import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { Channel } from 'amqplib';

@Injectable()
export class UserRabbitMQProducer {
  constructor(private readonly channel: Channel) {}

  async publishUserCreated(user: User) {
    this.channel.publish('user.exchange', 'user.created', Buffer.from(JSON.stringify(user)));
  }
}
