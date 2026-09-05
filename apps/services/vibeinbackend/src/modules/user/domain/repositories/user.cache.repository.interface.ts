import { User } from "../entities/user.entity";
export interface UserCacheRepository{
  getUser(id: string);
  setUser(user: User);
}