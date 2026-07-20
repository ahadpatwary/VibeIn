import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DatabaseConnection } from "./database.client";
import { Connection } from "mongoose";


@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {


    constructor(
        private readonly databaseClient: DatabaseConnection,
    ) {}

    async onModuleInit() {

        this.databaseClient.connect();
    }

    async onModuleDestroy() {

        this.databaseClient.disconnect();
    }

    get client(): Connection {
        return this.databaseClient.getClient;
    }

}