import * as mongoose from "mongoose";
import {ICustomer} from "../interfaces";

let Schema = mongoose.Schema;
const customerSchema: mongoose.Schema = new Schema({
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
    }
});

type ICustomerDocument = ICustomer & mongoose.Document;
const CustomerM: mongoose.Model<ICustomerDocument> = mongoose.model<ICustomerDocument>("Customer", customerSchema);

export class CustomerModel {
    static createCustomer(customer: ICustomer): Promise<ICustomer> {
        return CustomerM.create(customer);
    }

    static deleteCustomer(id: string): Promise<ICustomer> {
        return CustomerM.findByIdAndRemove(id).exec();
    }

    static getCustomer(id: string): Promise<ICustomer> {
        const select = "-__v";
        return CustomerM.findById(id, select).exec();
    }

    static getCustomers(): Promise<ICustomer[]> {
        const select = "-__v";
        return CustomerM.find({}, select).exec();
    }

    static updateCustomer(id: string, customer: ICustomer): Promise<ICustomer> {
        const update = {
            "firstName": customer.firstName,
            "lastName": customer.lastName,
            "moblePhone": customer.mobilePhone,
            "mail": customer.mail,
            "address.street": customer.address.street,
            "address.zipCode": customer.address.zipCode,
            "address.city": customer.address.city
        };

        return CustomerM.findByIdAndUpdate(id, customer).exec();
    }
}