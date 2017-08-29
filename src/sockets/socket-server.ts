import * as SocketIO from "socket.io";
import {Server} from "http";
import SocketChatServer from "./socket-chat-server";
import SocketCommonServer from "./socket.common-server";
import {SocketLookupModel} from "../models/socketLookupModel";
import {ISocketNewUserConnected} from "../interfaces";
import {AuthenticationTokenLookupModel} from "../models/authenticationModel";
import {errorHandler} from "../utilities";
import Socket = SocketIO.Socket;
import Namespace = SocketIO.Namespace;

export default class SocketServer {
    private io: SocketIO.Server;
    private socketChatServer: SocketChatServer = null;
    private socketCommonServer: SocketCommonServer = null;

    constructor(httpServer: Server) {
        this.io = SocketIO(httpServer);

        this.socketChatServer = SocketChatServer.bootstrap(this.io);
        this.socketCommonServer = SocketCommonServer.bootstrap(this.io);
    }

    static bootstrap(httpServer: Server) {
        return new SocketServer(httpServer);
    }

    static validateConnection(namespace: Namespace, socket: Socket, userId: string, token: string, user: ISocketNewUserConnected, callback: () => void) {
        AuthenticationTokenLookupModel.isTokenValidByUserId(token, userId).then((isValid: boolean) => {
            if (isValid) {
                SocketServer.saveConnectedUser(namespace, socket, userId, user, callback);
            } else {
                socket.disconnect(false);
            }
        }, errorHandler);
    }

    static saveConnectedUser(nameSpace: Namespace, socket: Socket, userId: string, user: ISocketNewUserConnected, callback: () => void) {
        const activeSocketIds = SocketServer.getActiveSocketIds(nameSpace);
        SocketLookupModel.removeUnusedSockets(activeSocketIds, nameSpace.name).then(() => {
            SocketLookupModel.createOrUpdate(socket.id, userId, nameSpace.name, user).then(() => {
                if (callback) {
                    callback();
                }
            }, errorHandler);
        }, errorHandler);
    }

    static removeDisconnectedUser(socket: Socket, callback: () => void) {
        SocketLookupModel.removeBySocketId(socket.id).then(() => {
            if (callback) {
                callback();
            }
        }, errorHandler);
    }

    static getActiveSocketIds(nameSpace: Namespace): string [] {
        const ids: string [] = [];
        for (let socket in nameSpace.sockets) {
            ids.push(socket);
        }

        return ids;
    }
}
