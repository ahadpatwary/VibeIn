import { DB_TOKENS, MongooseClient, registerDatabaseModule } from "@app/mongo";
import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { container } from "tsyringe";

const MONGO_INITIALIZED = Symbol('MONGO_INITIALIZED');


@Module({})
export class MongoModule {

    static forRootAsync(): DynamicModule {
        return {
            module: MongoModule,

            imports: [ ConfigModule ],

            providers: [
                {
                    provide: 'MongoRegister',
                    inject: [ConfigService],

                    useFactory: (config: ConfigService) => {

     
                        registerDatabaseModule(undefined, {
                            uri: config.get<string>('database.uri')!,
                            connOption: {
                                dbName: config.get<string>('database.uri') ?? 'SoundFear',
                                maxPoolSize: 10,
                                minPoolSize: 3,
                            }
                        })

                        return true;
                    },
                },

                {
                    provide: DB_TOKENS.MongooseClient,
                    /** mongo client depend on registerMongo */
                    inject: [ConfigService, MONGO_INITIALIZED],
                    useFactory: async (config: ConfigService) => {
                        const mongooseClient =  container.resolve(MongooseClient);
                        await mongooseClient.connect(config.get<string>('database.uri')!);
                        return mongooseClient;
                    },
                },

            ],

            global: true,

            exports: [
                DB_TOKENS.MongooseClient
            ],
        };
    }
}