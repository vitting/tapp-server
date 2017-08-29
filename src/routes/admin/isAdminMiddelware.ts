import * as express from "express";
import {NextFunction, Request, Response} from "express";
import * as passport from "passport";
import {Router} from "express-serve-static-core";
import Utilities from "../../utilities";

const isAdminRouter: Router = express.Router();

isAdminRouter.use("*", passport.authorize("jwt"), (req: Request, res: Response, next: NextFunction) => {
    if (req["account"] && req["account"].admin) {
        next();
    } else {
        res.json(Utilities.createResponseValue(false, "User is not admin"));
    }
});

export {isAdminRouter}