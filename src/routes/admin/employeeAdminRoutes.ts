import * as express from "express";
import {Request, Response} from "express";
import * as passport from "passport";
import {Router} from "express-serve-static-core";
import {EmployeeModel} from "../../models/employeeModel";
import Utilities from "../../utilities";
import Logger from "../../logger";
import {IEmployee} from "../../interfaces";

const employeeAdminRouter: Router = express.Router();

employeeAdminRouter.route("/employees").get(passport.authorize("jwt"), (req: Request, res: Response) => {
    EmployeeModel.getEmployees().then((employees) => {
        res.json(Utilities.createResponseValue(true, employees));
    }, (err) => {
        Logger.error("/employees", err);
        res.json(Utilities.createResponseValue(false, err));
    });
}).post(passport.authorize("jwt"), (req: Request, res: Response) => {
    EmployeeModel.createEmployee(req.body).then((employee) => {
        res.json(Utilities.createResponseValue(true, employee));
    }, (err) => {
        Logger.error("/employees", err);
        res.json(Utilities.createResponseValue(false, err));
    });
});

employeeAdminRouter.route("/employees/:id").put(passport.authorize("jwt"), (req: Request, res: Response) => {
    EmployeeModel.updateEmplyeeById(req.params["id"], req.body).then((employee: IEmployee) => {
        res.json(Utilities.createResponseValue(true, employee));
    }, (err) => {
        Logger.error("/employees/:id", err);
        res.json(Utilities.createResponseValue(false, err));
    });
}).delete(passport.authorize("jwt"), (req: Request, res: Response) => {
    EmployeeModel.deleteEmployeeById(req.params.id).then((employee: IEmployee) => {
        res.json(Utilities.createResponseValue(true, employee));
    }, (err) => {
        Logger.error("/employees/:id", err);
        res.json(Utilities.createResponseValue(false, err));
    });
});

export {employeeAdminRouter};