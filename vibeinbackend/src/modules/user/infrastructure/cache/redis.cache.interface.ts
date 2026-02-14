import { User } from '../../domain/entities/user.entity';

export abstract class UserCache {
  abstract getUser(id: string): Promise<User | null>;
  abstract setUser(user: User): Promise<void>;
}
