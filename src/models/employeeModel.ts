import * as mongoose from "mongoose";
import Utilities from "../utilities";
import {IEmployee} from "../interfaces";

let Schema = mongoose.Schema;
const employeeSchema: mongoose.Schema = new Schema({
    "firstName": {
        "type": String,
        "required": true
    },
    "lastName": {
        "type": String,
        "required": true
    },
    "address": {
        "street": {
            "type": String,
            "required": true
        },
        "zipCode": {
            "type": Number,
            "required": true
        },
        "city": {
            "type": String,
            "required": true
        }
    },
    "mail": {
        "type": String,
        "required": false
    },
    "mobilePhone": {
        "type": String,
        "required": true
    },
    "username": {
        "type": String,
        "required": true,
        "default": "rememberToChange"
    },
    "password": {
        "type": String,
        "required": true,
        "default": "password1234"
    },
    "admin": {
        "type": Boolean,
        "required": true,
        "default": false
    }
});

type IEmployeeDocument = IEmployee & mongoose.Document;
const EmployeeM: mongoose.Model<IEmployeeDocument> = mongoose.model<IEmployeeDocument>("Employee", employeeSchema);

export class EmployeeModel {
    static getOfflineUsers(onlineUserIds: string []) {
        const query = {_id: {$nin: onlineUserIds}};
        const sort = {firstName: 1, lastName: 1};

        return EmployeeM.find(query).sort(sort).exec();
    }

    static createEmployee(employee: IEmployee) {
        return Utilities.hashPassword(employee.password).then((hash) => {
            employee.password = hash;

            return Promise.resolve(EmployeeM.create(new EmployeeM(employee)));
        });
    }

    static getEmployeeByUsername(username: string) {
        const query = {"username": username};

        return EmployeeM.findOne(query).exec();
    }

    static getEmployeeById(id: string | any) {
        return EmployeeM.findById(id).exec();
    }

    static getEmployees() {
        const select = "-__v -password";
        return EmployeeM.find({}, select).exec();
    }

    static deleteEmployeeById(id: string) {
        return EmployeeM.findByIdAndRemove(id).exec();
    }

    static updateEmplyeeById(id: string, employee: IEmployee) {
        const update = {
            "firstName": employee.firstName,
            "lastName": employee.lastName,
            "moblePhone": employee.mobilePhone,
            "mail": employee.mail,
            "address.street": employee.address.street,
            "address.zipCode": employee.address.zipCode,
            "address.city": employee.address.city
        };

        return EmployeeM.findByIdAndUpdate(id, update).exec();
    }

    static updateEmployeePasswordById(id: string, password: string) {
        return Utilities.hashPassword(password).then((hash) => {
            const update = {
                "password": hash
            };
            return Promise.resolve(EmployeeM.findByIdAndUpdate(id, update).exec());
        });
    }

    static comparePassword(candidatePassword: string, hashPassword: string) {
        return Utilities.comparePassword(candidatePassword, hashPassword);
    }
}