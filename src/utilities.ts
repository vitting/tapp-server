import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import {Moment} from "moment";
import * as Chance from "chance";
import {config} from "./config/config";
import {
    IAuthResponse,
    IEmployee,
    IResponseValue,
    ISocketNewUserConnected,
    IStartAndEndDate,
    ITokenPayload
} from "./interfaces";
import Logger from "./logger";
import StartOf = moment.unitOfTime.StartOf;

export function errorHandler(err: any) {
    Logger.error(err);
}

export default class Utilities {
    static stripPasswordFromObject(obj: any): any {
        let objClone = this.cloneSimple(obj);
        if (objClone || objClone.hasOwnProperty("password")) delete objClone.password;
        return objClone;
    }

    static stripVersionFromMongoDbObject(obj: any): any {
        let objClone = this.cloneSimple(obj);
        if (objClone || objClone.hasOwnProperty("__v")) delete objClone.__v;
        return objClone;
    }

    static stripPropsFromObj(obj: any): any {
        return this.stripVersionFromMongoDbObject(this.stripPasswordFromObject(obj));
    }

    static cloneSimple(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }

    static generateJwtToken(payload: ITokenPayload, expiresIn: string | number = "1d"): string {
        return "JWT " + jwt.sign(payload, config.secretJwt, {
                expiresIn: expiresIn,
                subject: payload.user._id.toString()
            });
    }

    static convertTokenExpirationToDate(expires: number): Date {
        const date = new Date(0);
        date.setUTCSeconds(expires);
        return date;
    }

    static verifyJwtToken(token: string) {
        return jwt.verify(token.replace("JWT ", ""), config.secretJwt);
    }

    static hashPassword(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) reject(err);
                resolve(hash);
            });
        });
    }

    static comparePassword(candidatePassword: string, hashPassword: string) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(candidatePassword, hashPassword, (err, isMatch) => {
                if (err) reject(err);
                resolve(isMatch);
            });
        });
    }

    static getStartAndEndDate(date: string | Date | Moment, type: StartOf): IStartAndEndDate {
        let startDate = moment(date).startOf(type);
        let endDate = moment(date).endOf(type);
        return {
            startDate: startDate,
            endDate: endDate
        };
    }

    static createResponseValue(success: boolean, data: any = null, msg: string = ""): IResponseValue {
        return {
            success: success,
            msg: msg,
            data: data
        };
    }

    static createAuthResponseValue(success: boolean, data: any = null, msg: string = "error", token: string = null): IAuthResponse {
        return {
            success: success,
            msg: msg,
            token: token,
            data: data
        };
    }

    static convertUsersToSocketNewUserConnected(users: IEmployee[]): ISocketNewUserConnected[] {
        const socketNewUserConnected: ISocketNewUserConnected[] = [];
        for (let user of users) {
            socketNewUserConnected.push(this.convertUserToSocketNewUserConnected(user));
        }

        return socketNewUserConnected;
    }

    static convertUserToSocketNewUserConnected(user: IEmployee): ISocketNewUserConnected {
        return {
            id: user._id,
            name: user.firstName + " " + user.lastName,
            socketId: ""
        };
    }

    static generatePassword(): string {
        let chance = new Chance();

        let word: string = chance.word({syllables: 3});
        let num: number = chance.natural({min: 1, max: 99});
        return word + num;
    }
}
