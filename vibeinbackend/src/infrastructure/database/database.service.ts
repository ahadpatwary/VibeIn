import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DatabaseConnection } from "./database.client";



@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {


    constructor(
        private readonly databaseClient: DatabaseConnection,
    ) {}

    async onModuleInit() {
        if(this.databaseClient.connected) return this.databaseClient.getConnection;

        this.databaseClient.connect();
    }

    async onModuleDestroy() {
        if(this.databaseClient.connected) return;

        this.databaseClient.disconnect();
    }

    get connected(): boolean {
        return this.databaseClient.connected;
    }

}