import * as mongoose from "mongoose";
import {Connection} from "mongoose";
import Logger from "../logger";


export class MongooseConnect {
    static connect(mongoDbUrl: string) {
        // Set promise library for MongoDb
        let options = {promiseLibrary: global.Promise, useMongoClient: true};

        // Set promise library for Moongoose
        (<any>mongoose).Promise = global.Promise;

        mongoose.connect(mongoDbUrl, options).then(() => {
            Logger.info("Connected to MongoDB");
        }, (err) => {
            Logger.error("MongoDB connection error", err);
        });

        mongoose.connection.on("error", (err: mongoose.Error) => {
            Logger.error("Database error", err);
        });
    }

    static get connection(): Connection {
        return mongoose.connection;
    }
}
