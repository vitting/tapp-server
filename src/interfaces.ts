import {Moment} from "moment";

export interface IObjectIndex {
    [index: string]: number;
}

export interface IAuthenticationTokenLookup {
    userId: string;
    token: string;
    date: Date;
}

export interface ISocketLookup {
    _id?: string;
    socketId?: string;
    userId?: string;
    date?: Date;
    user?: ISocketNewUserConnected;
    path?: string;
    openWindows?: string[];
}

export interface IChatMessage {
    _id?: string;
    date: Date;
    receiverId: string;
    senderId: string;
    message: string;
    messageRead: boolean;
}

export interface ISocketNewUserConnected {
    id: string;
    name: string;
    socketId: string;
}

export interface ICalendarEvent {
    start: Date;
    title: string;
    color: {
        primary: string,
        secondary: string
    };
}

export interface IStartAndEndDate {
    startDate: Moment;
    endDate: Moment;
}

export interface ITokenPayload {
    user: {
        _id: string;
        name: string;
        isAdmin: boolean;
    };
}

export interface IResponseValue {
    success: boolean;
    msg?: string;
    data?: any;
}

export interface IAuthResponse extends IResponseValue {
    token: string;
}

export interface IPerson {
    _id?: string;
    firstName: string;
    lastName: string;
    address: IAddress;
    mail: string;
    mobilePhone: string;
}

export interface IEmployee extends IPerson {
    admin: boolean;
    username?: string;
    password?: string;
}

export class Employee implements IEmployee {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    address: IAddress;
    mobilePhone: string;
    mail: string;
    admin: boolean;

    constructor(username: string, password: string, firstName: string, lastName: string, address: IAddress, mobilePhone: string, mail: string, admin: boolean) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.mobilePhone = mobilePhone;
        this.mail = mail;
        this.admin = admin;
    }
}

export interface IAddress {
    street: string;
    zipCode: number;
    city: string;
}

export interface ICustomer extends IPerson {
}

export interface ITask {
    _id?: string;
    customer: ICustomer | string;
    startDate: Date;
    endDate: Date;
    description: string;
    address: IAddress;
    employeesAssigned: string[] | IEmployee[];
}