import * as mongoose from "mongoose";
import {IAuthenticationTokenLookup} from "../interfaces";

let Schema = mongoose.Schema;
const authenticationTokenLookupSchema: mongoose.Schema = new Schema({
    "date": {
        "type": Date,
        "required": true,
        "default": Date.now
    },
    "userId": {
        "type": String,
        "required": true
    },
    "token": {
        "type": String,
        "required": true
    }
});

type IAuthenticationTokenLookupDocument = IAuthenticationTokenLookup & mongoose.Document;
const AuthenticationTokenLookupM: mongoose.Model<IAuthenticationTokenLookupDocument> = mongoose.model<IAuthenticationTokenLookupDocument>("AuthenticationTokenLookup", authenticationTokenLookupSchema);

export class AuthenticationTokenLookupModel {
    static setToken(currentToken: string, newToken: string, userId: string) {
        return this.removeToken(currentToken).then(() => {
            const data = {
                userId: userId,
                token: newToken,
                date: new Date(Date.now())
            };

            return AuthenticationTokenLookupM.create(new AuthenticationTokenLookupM(data));
        });
    }

    static getToken(token: string) {
        const query = {token: token};

        return AuthenticationTokenLookupM.findOne(query).exec();
    }

    static removeToken(token: string) {
        if (token) {
            const query = {token: token};

            return AuthenticationTokenLookupM.findOneAndRemove(query).exec();
        } else {
            return Promise.resolve(null);
        }

    }

    static isTokenValidByUserId(token: string, userId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.getToken(token).then((lookup: IAuthenticationTokenLookup) => {
                if (lookup) {
                    resolve(lookup.userId === userId);
                } else {
                    resolve(false);
                }
            }, (err) => {
                reject(err);
            });
        });
    }
}
