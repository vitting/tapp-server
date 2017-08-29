import * as mongoose from "mongoose";
import {ISocketLookup, ISocketNewUserConnected} from "../interfaces";

let Schema = mongoose.Schema;
const socketLookupSchema: mongoose.Schema = new Schema({
    "date": {
        "type": Date,
        "required": true,
        "default": Date.now
    },
    "userId": {
        "type": String,
        "required": true
    },
    "socketId": {
        "type": String,
        "required": true
    },
    "user": {
        "type": Schema.Types.Mixed,
        "required": false,
        "default": null
    },
    "path": {
        "type": String,
        "required": true
    },
    "openWindows": [String]
});

type ISocketLookupDocument = ISocketLookup & mongoose.Document;
const SocketLookupM: mongoose.Model<ISocketLookupDocument> = mongoose.model<ISocketLookupDocument>("SocketLookup", socketLookupSchema);

export class SocketLookupModel {
    static createOrUpdate(socketId: string, userId: string, path: string, user: ISocketNewUserConnected) {
        const query = {userId: userId, socketId: socketId, path: path};
        const update: ISocketLookup = {
            socketId: socketId,
            userId: userId,
            user: user,
            path: path,
            date: new Date(Date.now()),
            openWindows: []
        };
        const options = {upsert: true};

        return SocketLookupM.update(query, update, options).exec();
    }

    static removeBySocketId(socketId: string) {
        const query = {socketId: socketId};

        return SocketLookupM.remove(query).exec();
    }

    static removeByUserId(userId: string, path: string) {
        const query = {userId: userId, path: path};

        return SocketLookupM.remove(query).exec();
    }

    static getByUserId(userId: string, path: string): Promise<ISocketLookup> {
        const query = {userId: userId, path: path};
        const sort = {date: -1};

        return SocketLookupM.findOne(query).sort(sort).exec();
    }

    static getBySocketId(socketId: string) {
        const query = {socketId: socketId};

        return SocketLookupM.find(query).exec();
    }

    static removeUnusedSockets(socketIds: string [], path: string) {
        const query = {path: path, socketId: {$nin: socketIds}};

        return SocketLookupM.remove(query).exec();
    }

    static getOnlineUsers(socketIds: string []): Promise<ISocketLookup[]> {
        const query = {socketId: {$in: socketIds}};
        const select = "-_id -__v -userId -socketId -date";
        const sort = {"user.name": 1};

        return SocketLookupM.find(query, select).sort(sort).exec();
    }

    static addActiveChatWindowToUser(myId: string, chatWindowUserId: string, path: string) {
        const query = {userId: myId, path: path};
        const update = {
            $push: {openWindows: chatWindowUserId}
        };

        return SocketLookupM.update(query, update).exec();
    }

    static removeActiveChatWindowFromUser(myId: string, chatWindowUserId: string, path: string) {
        const query = {userId: myId, path: path};
        const update = {
            $pull: {openWindows: chatWindowUserId}
        };

        return SocketLookupM.update(query, update).exec();
    }

    static isChatWindowOpen(myId: string, chatWindowUserId: string, path: string): Promise<boolean> {
        const query = {userId: myId, path: path, openWindows: chatWindowUserId};

        return new Promise((resolve, reject) => {
            SocketLookupM.find(query).count().exec((err, res) => {
                if (err) reject(err);
                resolve(res > 0);
            });
        });
    }

    static isUserConnected(userId: string, path: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.getByUserId(userId, path).then((user: ISocketLookup) => {
                resolve(user !== null);
            }, (err) => {
                reject(err);
            });
        });
    }
}