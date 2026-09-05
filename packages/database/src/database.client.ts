import mongoose, { Connection, ConnectOptions } from "mongoose";
import { DATABASE_EVENTS } from "./constants/database.constant";
import { DatabaseConnectionException, DatabaseNotInitializedException } from "./exceptions/database.exception";
import { type DatabaseConfig } from "./types/database.type";
import { ILogger } from "./utils/database.logger";
import { Injectable } from "@nestjs/common";


@Injectable()
export class DatabaseConnection {
    private connection: Connection | null = null;
    private isConnecting: boolean = false;

    constructor(
        private readonly config: DatabaseConfig,
        private readonly logger: ILogger,
    ) {}

    async connect(): Promise<Connection> {


        if(this.isConnecting) throw new Error('Connection attempt already in progress')

        this.isConnecting = true;
  

        const maxRetries = this.config.maxConnectionRetries ?? 10;
        const retryStrategy = this.config.retryStrategy ?? this.defaultRetryStrategy.bind(this);

        try {

            this.connection = await this.connectWithRetry(this.createConnInstance, maxRetries, retryStrategy);
            

            this.logger.info('MongoDB connected successfully', {
                dbName: this.config.dbName,
            });

            return this.connection;

        } catch (error) {

            throw new DatabaseConnectionException(error as Error, {
                uri: this.maskUri(this.config.uri),
                dbName: this.config.dbName,
            });

        } finally {
            this.isConnecting = false;
        }

    }

    async disconnect(): Promise<void> {
        if (!this.connection) return;
 
        try {
            await this.connection.close();
 
            this.logger.info('MongoDB disconnected gracefully');
        } catch {
            await this.connection.close(true);
            this.logger.warn('MongoDB disconnected forcefully');
        } finally {
            this.connection = null;
        }
    }

    get getClient(): Connection {
        
        if(!this.connection) {
            throw new DatabaseConnectionException(
                new Error('Database client missing')
            )
        }

        this.connected();

        return this.connection;
 
    }

    private connected():void {
        if(this.connection!.readyState === 1){ 
            throw new DatabaseConnectionException(
                new Error('Database connection missing')
            )
        }  
    }

    private get createConnInstance(): Connection {

        if(this.connection) return this.connection;

        const options: ConnectOptions = {
            dbName: this.config.dbName,
            maxPoolSize: this.config.maxPoolSize ?? 10,
            minPoolSize: this.config.minPoolSize ?? 5,
            connectTimeoutMS: this.config.connectTimeoutMS ?? 10000,
            socketTimeoutMS: this.config.socketTimeoutMS ?? 45000,
            serverSelectionTimeoutMS: this.config.serverSelectionTimeoutMS ?? 10000,
            retryWrites: this.config.retryWrites ?? true,
            autoIndex: this.config.autoIndex ?? true,
            
            // retryReads: true,
            // waitQueueTimeoutMS: 3000, 
        };

        this.connection = mongoose.createConnection(this.config.uri, options);    
        
        if(!this.connection) {
            throw new DatabaseNotInitializedException()
        }

        this.registerEventHandlers(this.connection);

        return this.connection;

    }

    private async connectWithRetry(
        client: Connection,
        maxRetries: number,
        retryStrategy: (attempt: number) => number | null,
    ): Promise<Connection> {
        let attempt = 0;
 
        while (true) {
 
            try {
                await client.asPromise();
                return client;
            } catch (err) {
                attempt += 1;
                await client.close(true).catch(() => undefined);
 
                if (attempt > maxRetries) {
                    this.logger.error('MongoDB max reconnection attempts reached. Giving up.', {
                        attempts: attempt,
                    });
                    throw err;
                }
 
                const delay = retryStrategy(attempt);
                if (delay === null) {
                    throw err;
                }
 
                this.logger.warn(`MongoDB connecting failed, retrying in ${delay}ms...`, {
                    attempt,
                    error: (err as Error).message,
                });
 
                await this.sleep(delay);
            }
        }
    }
 
    private defaultRetryStrategy(attempt: number): number | null {
        if (attempt > 10) {
            return null;
        }
        return Math.min(attempt * 500, 5000);
    }
 
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
 
    private registerEventHandlers(connection: Connection): void {
        connection.on(DATABASE_EVENTS.CONNECTING, () => {
 
            this.logger.info('MongoDB connecting...');
        });
 
        connection.on(DATABASE_EVENTS.CONNECTED, () => {
            this.logger.info('MongoDB connection established');
        });
 
        connection.on(DATABASE_EVENTS.OPEN, () => {
            this.logger.info('MongoDB connection is open and ready');
        });
 
        connection.on(DATABASE_EVENTS.ERROR, (err: Error) => {
            this.logger.error('MongoDB connection error', { error: err.message });
        });
 
        connection.on(DATABASE_EVENTS.DISCONNECTED, () => {
            this.logger.warn('MongoDB connection disconnected');
        });
 
        connection.on(DATABASE_EVENTS.RECONNECTED, () => {
            this.logger.info('MongoDB reconnected');
        });
 
        connection.on(DATABASE_EVENTS.CLOSE, () => {
            this.logger.warn('MongoDB connection closed');
        });
    }
 
    private maskUri(uri: string): string {
        return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    }
}