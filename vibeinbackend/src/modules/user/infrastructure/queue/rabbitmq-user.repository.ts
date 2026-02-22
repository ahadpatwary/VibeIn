import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { RabbitMqService } from 'src/shared/modules/queue/rabbitmq.service';

@Injectable()
export class UserRabbitMQProducer {
  constructor(private readonly rabbitService: RabbitMqService) {}

  async publishUserCreated(user: User) {
    await this.rabbitService.publish('user.created', Buffer.from(JSON.stringify(user)));
  }
}