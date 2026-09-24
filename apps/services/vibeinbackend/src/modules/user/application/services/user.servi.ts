// import { Inject, Injectable } from '@nestjs/common';

// @Injectable()
// export class UserService {
//   constructor(

//   ) {}

// }

// async getUser(id: string): Promise<User | null> {

//   const user = await this.userPersistence.findById(id);
//     if (user) await this.userCache.setUser(user);

//   return user;
// }

// async existUserName(userName: string): Promise<boolean> {

//   const ans = this.bloomFilter.stats()
//   console.log('ans', ans);
//   return true;
// }

// async createUser(CreateUserBody: CreateUserDto){
//   // const user = new User(Date.now().toString(), dto.name, dto.email);
//   const saved = await this.userPersistence.create(CreateUserBody);
//   await this.userCache.setUser(saved);
//   // await this.userQueue.publishUserCreated(saved);
//   return saved;
// }

// async updateUser(id: string, body: CreateUserDto) {
//   return this.userPersistence.update(id, body);
// }

// async deleteUser(id: string) {
//   return this.userPersistence.delete(id);
// }

// async getSearchUser(name: string) {
//   return this.userPersistence.getSearchUser(name);
// //   this.userRepo.searchUserFromFriendlist('12345', 'abdul ahad patwary');
// //   this.userRepo.searchUserFromMutualFriendlist('12345', 'abdul ahad patwary');
// //   this.userRepo.searchUserFromGlobally('12345', 'abdul ahad patwary');

// }
