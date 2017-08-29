import * as express from "express";
import {Request, Response} from "express";
import * as passport from "passport";
import {Router} from "express-serve-static-core";
import {EmployeeModel} from "../models/employeeModel";
import Utilities from "../utilities";
import Logger from "../logger";

const employeeRouter: Router = express.Router();

employeeRouter.route("/employees/:id").get(passport.authorize("jwt"), (req: Request, res: Response) => {
    EmployeeModel.getEmployeeById(req.params.id).then((employee) => {
        res.json(Utilities.createResponseValue(true, Utilities.stripPropsFromObj(employee)));
    }, (err) => {
        Logger.error("/employees/:id", err);
        res.json(Utilities.createResponseValue(false, err));
    });
}).put(passport.authorize("jwt"), (req: Request, res: Response) => {
    EmployeeModel.updateEmplyeeById(req.params["id"], req.body).then(() => {
        res.json(Utilities.createResponseValue(true));
    }, (err) => {
        Logger.error("/employees/:id", err);
        res.json(Utilities.createResponseValue(false, err));
    });
});

employeeRouter.route("/employees/:id/chat").get(passport.authorize("jwt"), (req: Request, res: Response) => {
    EmployeeModel.getEmployeeById(req.params["id"]).then((user) => {
        res.json(Utilities.createResponseValue(true, Utilities.convertUserToSocketNewUserConnected(user)));
    });
});

export {employeeRouter};