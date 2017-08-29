import * as express from "express";
import * as http from "http";
import {Server as HttpServer} from "http";
//import {Server as HttpsServer} from "https";
import * as methodOverride from "method-override";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as compression from "compression";
import * as expressSession from "express-session";
import * as MongoStore from "connect-mongo";
import * as cors from "cors";
import {MongooseConnect} from "./config/mongoose-config";
import {config} from "./config/config";
import {Express} from "express-serve-static-core";
import PassportConfig from "./config/passport-config";
import SocketServer from "./sockets/socket-server";
import {RoutesConfig} from "./config/routes-config";
import Logger from "./logger";
import * as fs from "fs";
import * as path from "path";

class NodeServer {
    private app: Express = express();
    private mongoStore = MongoStore(expressSession);
    httpServer: HttpServer = null;
    //httpsServer: HttpsServer = null;

    constructor() {
        this.createLogsFolderIfNotExists();
        this.initServers();
        this.initExpress();
        this.initMongoose();
        this.initSession();
        PassportConfig.config(this.app);
        RoutesConfig.config(this.app);
        this.createServers();
    }

    static bootstrap() {
        return new NodeServer();
    }


    initServers() {
        this.httpServer = http.createServer(this.app);
        //this. httpsServer = https.createServer(HttpsOptions.config(), this.app);
    }

    private initExpress() {
        this.app.set("httpPort", (process.env.PORT || config.httpPort));
        this.app.set("httpsPort", (process.env.PORT || config.httpsPort));
        this.app.use(methodOverride());
        this.app.use(compression());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private initMongoose() {
        if (process.env.NODE_ENV === "development") {
            MongooseConnect.connect(config.mongoDbUrlDev);
        } else {
            MongooseConnect.connect(config.mongoDbUrlProd);
        }
    }

    private initSession() {
        this.app.use(expressSession({
            "secret": config.sessionSecret,
            "resave": false,
            "cookie": {},
            "saveUninitialized": false,
            "store": new this.mongoStore({
                "mongooseConnection": MongooseConnect.connection
            })
        }));
    }

    private createServers() {
        this.httpServer.listen(this.app.get("httpPort"), () => {
            if (process.env.NODE_ENV === "development") {
                let d: Date = new Date(Date.now());
                Logger.info(`HttpServer started at: ${d.getHours()}:${d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()}:${d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()}`);
                Logger.info("Express HttpServer listening on localhost:" + this.app.get("httpPort"));
            } else {
                Logger.info("Express HttpServer listening on port", this.app.get("httpPort"));
            }
        });

        // this.httpsServer.listen(this.app.get("httpsPort"), () => {
        //     if (process.env.NODE_ENV === "development") {
        //         let d: Date = new Date(Date.now());
        //         Logger.info(`HttpsServer started at: ${d.getHours()}:${d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()}:${d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()}`);
        //         Logger.info("Express HttpsServer listening on localhost:" + this.app.get("httpsPort"));
        //     } else {
        //         Logger.info("Express HttpsServer listening on port", this.app.get("httpsPort"));
        //     }
        // });
    }

    private createLogsFolderIfNotExists() {
        if (!fs.existsSync(path.join(__dirname, "../", "logs"))) {
            fs.mkdirSync(path.join(__dirname, "../", "logs"));
        }
    }
}

const server = NodeServer.bootstrap();
const socketServer = SocketServer.bootstrap(server.httpServer);
