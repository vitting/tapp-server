import * as express from "express";
import {Request, Response} from "express";
import {Router} from "express-serve-static-core";
import Utilities from "../utilities";
import Logger from "../logger";
import {EmployeeModel} from "../models/employeeModel";

const testRouter: Router = express.Router();

testRouter.route("/employees").get((req: Request, res: Response) => {
    console.log(req.headers);
    EmployeeModel.getEmployees().then((employees) => {
        res.json(Utilities.createResponseValue(true, employees));
    }, (err) => {
        Logger.error("/employees", err);
        res.json(Utilities.createResponseValue(false, err));
    });
}).post((req: Request, res: Response) => {
    EmployeeModel.createEmployee(req.body).then((employee) => {
        res.json(Utilities.createResponseValue(true, employee));
    }, (err) => {
        Logger.error("/employees", err);
        res.json(Utilities.createResponseValue(false, err));
    });
});

testRouter.route("/employees2").get((req: Request, res: Response) => {
    console.log(req.baseUrl);
    EmployeeModel.getEmployees().then((employees) => {
        res.json(Utilities.createResponseValue(true, employees));
    }, (err) => {
        Logger.error("/employees2", err);
        res.json(Utilities.createResponseValue(false, err));
    });
}).post((req: Request, res: Response) => {
    EmployeeModel.createEmployee(req.body).then((employee) => {
        res.json(Utilities.createResponseValue(true, employee));
    }, (err) => {
        Logger.error("/employees2", err);
        res.json(Utilities.createResponseValue(false, err));
    });
});

export {testRouter};