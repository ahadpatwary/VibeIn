import { CreateUserDto } from '../../application/dto/user.dto';

export interface UserPersistenceRepository {
  findById(id: string);
  // abstract findById(id: string): Promise<User | null>;
  create(user: CreateUserDto);
  update(id: string, body: CreateUserDto);
  delete(id: string);
  // abstract searchUserFromFriendlist(userId: string, name: string): Promise<User>;
  // abstract searchUserFromMutualFriendlist(userId: string, name: string): Promise<User>;
  // abstract searchUserFromGlobally(userId: string, name: string): Promise<User>;
}