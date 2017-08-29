import Socket = SocketIO.Socket;
import Namespace = SocketIO.Namespace;
import {config} from "../config/config";
import {IChatMessage, IEmployee, IObjectIndex, ISocketLookup, ISocketNewUserConnected} from "../interfaces";
import {ChatMessageModel} from "../models/chatModel";
import {SocketLookupModel} from "../models/socketLookupModel";
import SocketServer from "./socket-server";
import {EmployeeModel} from "../models/employeeModel";
import Utilities, {errorHandler} from "../utilities";
import Logger from "../logger";

export default class SocketChatServer {
    private nspChatSocket: Namespace;
    private static server: SocketChatServer = null;

    constructor(public io: SocketIO.Server) {
        this.nspChatSocket = this.io.of(config.chatSocketPath);
        this.initChatSocket();
        Logger.info("Connected to SocketChatServer");
    }

    static bootstrap(io: SocketIO.Server) {
        if (!this.server) {
            this.server = new SocketChatServer(io);
        }

        return this.server;
    }

    private initChatSocket() {
        this.nspChatSocket.on("connect", (socket: Socket) => {
            socket.on("i_am_active", (user: ISocketNewUserConnected, token: string) => {
                SocketServer.validateConnection(this.nspChatSocket, socket, user.id, token, user, () => {
                    this.sendChatUsers();
                });
            });

            socket.on("message", (chatMessage: IChatMessage) => {
                this.saveNewMessage(socket, chatMessage, this.nspChatSocket.name);
            });

            socket.on("get_my_unread_messages", (myId: string) => {
                this.getUnreadMessagesCountForOfflineUsers(myId, socket.id);
            });

            socket.on("get_chat_history", (myId: string, yourId: string, callback: (result: IChatMessage[]) => void) => {
                ChatMessageModel.getMessages(myId, yourId).then((messages: IChatMessage[]) => {
                    ChatMessageModel.setMessageReadForUser(yourId, myId).then(() => {
                        callback(messages);
                    }, errorHandler);
                }, errorHandler);
            });

            socket.on("chat_window_open", (myId: string, chatWindowUserId: string) => {
                SocketLookupModel.addActiveChatWindowToUser(myId, chatWindowUserId, this.nspChatSocket.name);
            });

            socket.on("chat_window_close", (myId: string, chatWindowUserId: string) => {
                SocketLookupModel.removeActiveChatWindowFromUser(myId, chatWindowUserId, this.nspChatSocket.name);
            });

            socket.on("disconnect", () => {
                SocketServer.removeDisconnectedUser(socket, () => {
                    this.sendChatUsers();
                });
            });

            socket.on("error", (err: any) => {
                Logger.error("ChatSocket", err);
            });
        });
    }

    private saveNewMessage(socket: Socket, chatMessage: IChatMessage, path: string) {
        SocketLookupModel.getByUserId(chatMessage.receiverId, path).then((chatLookup: ISocketLookup) => {
            // If receiver is online and has sender chat window open
            if (chatLookup && chatLookup.openWindows && chatLookup.openWindows.lastIndexOf(chatMessage.senderId) !== -1) {
                const socketId = `${config.chatSocketPath}#${chatLookup.user.socketId}`;
                ChatMessageModel.saveMessage(chatMessage).then(() => {
                    this.nspChatSocket.to(socket.id).to(socketId).emit("message", chatMessage);
                    this.getUnreadMessagesCountForOfflineUsers(chatMessage.receiverId, socketId);
                }, errorHandler);
            } else {
                chatMessage.messageRead = false;
                ChatMessageModel.saveMessage(chatMessage).then(() => {
                    this.nspChatSocket.to(socket.id).emit("message", chatMessage);
                }, errorHandler);
            }
        }, errorHandler);
    }

    private sendChatUsers() {
        const activeSocketIds = SocketServer.getActiveSocketIds(this.nspChatSocket);
        SocketLookupModel.getOnlineUsers(activeSocketIds).then((users: ISocketLookup[]) => {
            const usersOnlineArray: ISocketNewUserConnected[] = [];
            const onlineUsersId: string [] = [];

            users.forEach((value) => {
                onlineUsersId.push(value.user.id);
                usersOnlineArray.push(value.user);
            });

            EmployeeModel.getOfflineUsers(onlineUsersId).then((usersOffline: IEmployee[]) => {
                const offlineUsers = Utilities.convertUsersToSocketNewUserConnected(usersOffline);
                this.nspChatSocket.emit("update_online_users", usersOnlineArray, offlineUsers);

            }, errorHandler);
        }, errorHandler);
    }

    private getUnreadMessagesCountForOfflineUsers(userId: string, socketId: string): void {
        ChatMessageModel.getMessagesNotReadByUserId(userId).then((messages: IChatMessage[]) => {
            let unreadMessagesCount: IObjectIndex = {};
            messages.forEach((message: IChatMessage) => {
                if (unreadMessagesCount[message.senderId]) {
                    unreadMessagesCount[message.senderId] = unreadMessagesCount[message.senderId] + 1;
                } else {
                    unreadMessagesCount[message.senderId] = 1;
                }
            });

            this.nspChatSocket.to(socketId).emit("my_unread_messages_count", unreadMessagesCount);
        });
    }
}