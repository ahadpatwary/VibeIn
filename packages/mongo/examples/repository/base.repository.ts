// import { Model, Document, FilterQuery, UpdateQuery, QueryOptions, ClientSession } from 'mongoose';
// import { mapMongooseError } from '../exception/mongoose-error.mapper';
// import { DocumentNotFoundException } from '../exception/database.exception';
// import type { PaginationOptions, PaginatedResult, Logger } from '../types/db.types';

// /**
//  * Generic, class-based repository over a Mongoose Model<T>.
//  * Not itself a DI-managed class (it's abstract) — decorate the concrete
//  * subclass with @injectable() and pass the model in explicitly:
//  *
//  *   @injectable()
//  *   class UserRepository extends BaseRepository<UserDocument> {
//  *     constructor() {
//  *       super(UserModel);
//  *     }
//  *   }
//  */
// export abstract class BaseRepository<T extends Document> {
//   protected constructor(
//     protected readonly model: Model<T>,
//     protected readonly logger?: Logger,
//   ) {}

//   async create(data: Partial<T>, session?: ClientSession): Promise<T> {
//     try {
//       const [doc] = await this.model.create([data], { session });
//       return doc;
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'create', model: this.model.modelName });
//     }
//   }

//   async findById(id: string, options?: QueryOptions): Promise<T | null> {
//     try {
//       return await this.model.findById(id, null, options).exec();
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'findById', model: this.model.modelName, id });
//     }
//   }

//   async findByIdOrThrow(id: string, options?: QueryOptions): Promise<T> {
//     const doc = await this.findById(id, options);
//     if (!doc) {
//       throw new DocumentNotFoundException(`${this.model.modelName} with id "${id}" not found`);
//     }
//     return doc;
//   }

//   async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
//     try {
//       return await this.model.findOne(filter, null, options).exec();
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'findOne', model: this.model.modelName });
//     }
//   }

//   async find(filter: FilterQuery<T> = {}, options?: QueryOptions): Promise<T[]> {
//     try {
//       return await this.model.find(filter, null, options).exec();
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'find', model: this.model.modelName });
//     }
//   }

//   async paginate(filter: FilterQuery<T> = {}, options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
//     const page = Math.max(1, options.page ?? 1);
//     const limit = Math.max(1, options.limit ?? 20);
//     const sort = options.sort ?? { _id: -1 };

//     try {
//       const [data, total] = await Promise.all([
//         this.model
//           .find(filter)
//           .sort(sort)
//           .skip((page - 1) * limit)
//           .limit(limit)
//           .exec(),
//         this.model.countDocuments(filter).exec(),
//       ]);

//       return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'paginate', model: this.model.modelName });
//     }
//   }

//   async updateById(id: string, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
//     try {
//       return await this.model.findByIdAndUpdate(id, update, { new: true, ...options }).exec();
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'updateById', model: this.model.modelName, id });
//     }
//   }

//   async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<number> {
//     try {
//       const result = await this.model.updateMany(filter, update).exec();
//       return result.modifiedCount;
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'updateMany', model: this.model.modelName });
//     }
//   }

//   async deleteById(id: string): Promise<boolean> {
//     try {
//       const result = await this.model.findByIdAndDelete(id).exec();
//       return result !== null;
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'deleteById', model: this.model.modelName, id });
//     }
//   }

//   async exists(filter: FilterQuery<T>): Promise<boolean> {
//     try {
//       return (await this.model.exists(filter)) !== null;
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'exists', model: this.model.modelName });
//     }
//   }

//   async count(filter: FilterQuery<T> = {}): Promise<number> {
//     try {
//       return await this.model.countDocuments(filter).exec();
//     } catch (error) {
//       throw mapMongooseError(error, { operation: 'count', model: this.model.modelName });
//     }
//   }
// }
