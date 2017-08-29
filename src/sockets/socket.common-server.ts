import Namespace = SocketIO.Namespace;
import {config} from "../config/config";
import SocketServer from "./socket-server";
import {ChatMessageModel} from "../models/chatModel";
import {IChatMessage} from "../interfaces";
import Logger from "../logger";
import Socket = SocketIO.Socket;
import Timer = NodeJS.Timer;

export default class SocketCommonServer {
    private nspCommonSocket: Namespace;
    private static server: SocketCommonServer = null;

    constructor(public io: SocketIO.Server) {
        this.nspCommonSocket = this.io.of(config.commonSocketPath);
        this.initCommonSocket();
        Logger.info("Connected to SocketCommonServer");
    }

    static bootstrap(io: SocketIO.Server) {
        if (!this.server) {
            this.server = new SocketCommonServer(io);
        }

        return this.server;
    }

    private myUnreadMessageCount(myId: string, mySocketId: string) {
        ChatMessageModel.getMessagesNotReadByUserId(myId).then((messages: IChatMessage[]) => {
            if (messages.length !== 0) {
                this.nspCommonSocket.to(mySocketId).emit("you_have_new_notifications", messages.length);
            }
        }, (err) => {
            Logger.error("myUnreadMessageCount", err);
        });
    }

    private initCommonSocket() {
        this.nspCommonSocket.on("connect", (socket: Socket) => {
            socket.on("i_am_active", (myId: string, token: string) => {
                SocketServer.validateConnection(this.nspCommonSocket, socket, myId, token, null, null);
            });

            socket.on("do_i_have_new_notifications", (myId: string) => {
                this.myUnreadMessageCount(myId, socket.id);
            });

            socket.on("disconnect", () => {
                SocketServer.removeDisconnectedUser(socket, null);
            });

            socket.on("error", (err: any) => {
                Logger.error("CommonSocket", err);
            });
        });
    }
}