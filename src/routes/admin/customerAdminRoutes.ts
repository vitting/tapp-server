import * as express from "express";
import * as passport from "passport";
import {Request, Response} from "express";
import {Router} from "express-serve-static-core";
import {CustomerModel} from "../../models/customerModel";
import Utilities from "../../utilities";
import Logger from "../../logger";
import {ICustomer} from "../../interfaces";

const customerAdminRouter: Router = express.Router();

customerAdminRouter.route("/customers").get(passport.authorize("jwt"), (req: Request, res: Response) => {
    CustomerModel.getCustomers().then((customers: ICustomer[]) => {
        res.json(Utilities.createResponseValue(true, customers));
    }, (err) => {
        Logger.error("/customers", err);
        res.json(Utilities.createResponseValue(false, err));
    });
}).post(passport.authorize("jwt"), (req: Request, res: Response) => {
    CustomerModel.createCustomer(req.body).then((customer: ICustomer) => {
        res.json(Utilities.createResponseValue(true, customer));
    }, (err) => {
        Logger.error("/customers", err);
        res.json(Utilities.createResponseValue(false, err));
    });
});

customerAdminRouter.route("/customers/:id").put(passport.authorize("jwt"), (req: Request, res: Response) => {
    CustomerModel.updateCustomer(req.params["id"], req.body).then((customer: ICustomer) => {
        res.json(Utilities.createResponseValue(true, customer));
    }, (err) => {
        Logger.error("/customers/:id", err);
        res.json(Utilities.createResponseValue(false, err));
    });
}).delete(passport.authorize("jwt"), (req: Request, res: Response) => {
    CustomerModel.deleteCustomer(req.params["id"]).then((customer: ICustomer) => {
        res.json(Utilities.createResponseValue(true, customer));
    }, (err) => {
        Logger.error("/customers/:id", err);
        res.json(Utilities.createResponseValue(false, err));
    });
});

export {customerAdminRouter};