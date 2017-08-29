import * as express from "express";
import {Request, Response} from "express";
import {Router} from "express-serve-static-core";
import {TaskModel} from "../models/taskModel";
import Utilities from "../utilities";
import Logger from "../logger";
import * as passport from "passport";

const taskRouter: Router = express.Router();

taskRouter.route("/tasks").get(passport.authorize("jwt"), (req: Request, res: Response) => {
    TaskModel.getTasks().then((tasks) => {
        res.json(Utilities.createResponseValue(true, tasks, ""));
    }, (err) => {
        Logger.error("/tasks", err);
        res.json(Utilities.createResponseValue(false, err, "error"));
    });
}).post(passport.authorize("jwt"), (req: Request, res: Response) => {
    TaskModel.createTask(req.body).then((task) => {
        res.json(Utilities.createResponseValue(true, task, ""));
    }, (err) => {
        Logger.error("/tasks", err);
        res.json(Utilities.createResponseValue(false, err, "error"));
    });
});

taskRouter.route("/tasks/:id").get(passport.authorize("jwt"), (req: Request, res: Response) => {
    TaskModel.getTask(req.params.id).then((task) => {
        res.json(Utilities.createResponseValue(true, task, ""));
    }, (err) => {
        Logger.error("/tasks/:id", err);
        res.json(Utilities.createResponseValue(false, err, "error"));
    });
}).put(passport.authorize("jwt"), (req: Request, res: Response) => {
    res.json({msg: "Update task", value: req.params["id"]});
}).delete(passport.authorize("jwt"), (req: Request, res: Response) => {
    res.json({msg: "Delete tasks", value: req.params["id"]});
});

taskRouter.route("/tasks/date/:date").get(passport.authorize("jwt"), (req: Request, res: Response) => {
    TaskModel.getTasksByDate(req.params.date, req.query.type).then((data) => {
        res.json(Utilities.createResponseValue(true, data, ""));
    }, (err) => {
        Logger.error("/tasks/date/:date", err);
        res.json(Utilities.createResponseValue(false, err, "error"));
    });
});

taskRouter.route("/tasks/users/").post(passport.authorize("jwt"), (req: Request, res: Response) => {
    TaskModel.addEmployeeToTask(req.body.taskId, req.body.userId).then((data) => {
        res.json(Utilities.createResponseValue(true));
    }, (err) => {
        Logger.error("/tasks/users/", err);
        res.json(Utilities.createResponseValue(false, err, "error"));
    });
});

export {taskRouter};