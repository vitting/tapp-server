import * as mongoose from "mongoose";
import {IChatMessage} from "../interfaces";

let Schema = mongoose.Schema;
const chatMessageSchema: mongoose.Schema = new Schema({
    "date": {
        "type": Date,
        "required": true,
        "default": Date.now
    },
    "receiverId": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "senderId": {
        "type": Schema.Types.ObjectId,
        "required": true
    },
    "message": {
        "type": String,
        "required": true
    },
    "messageRead": {
        "type": Boolean,
        "required": true,
        "default": true
    }
});

type IChatMessageDocument = IChatMessage & mongoose.Document;
const ChatMessageM: mongoose.Model<IChatMessageDocument> = mongoose.model<IChatMessageDocument>("ChatMessage", chatMessageSchema);

export class ChatMessageModel {
    static saveMessage(message: IChatMessage) {
        message.date = new Date(Date.now());
        return ChatMessageM.create(new ChatMessageM(message));
    }

    static getMessages(myId: string, yourId: string) {
        const query = {
            senderId: {"$in": [myId, yourId]},
            receiverId: {"$in": [myId, yourId]}
        };
        const selection = "-__v -_id";
        const sort = {"data": -1};

        return ChatMessageM.find(query, selection).sort(sort).exec();
    }

    static getMessagesNotReadByUserId(userId: string) {
        const query = {"receiverId": userId, "messageRead": false};
        return ChatMessageM.find(query).exec();
    }

    static setMessageReadForUser(senderId: string, receiverId: string) {
        const query = {"senderId": senderId, "receiverId": receiverId};
        const update = {"messageRead": true};
        const options = {"multi": true};

        return ChatMessageM.update(query, update, options).exec();
    }
}