import * as express from "express";
import {Request, Response} from "express";
import * as passport from "passport";
import {Router} from "express-serve-static-core";
import {EmployeeModel} from "../models/employeeModel";
import Utilities from "../utilities";
import {IAuthResponse, IEmployee} from "../interfaces";
import {AuthenticationTokenLookupModel} from "../models/authenticationModel";
import Logger from "../logger";

const authRouter: Router = express.Router();

authRouter.route("/user/isauthenticated/:userid").get((req: Request, res: Response) => {
    const token = req.header("Authorization");
    AuthenticationTokenLookupModel.isTokenValidByUserId(token, req.params["userid"]).then((isValid: boolean) => {
        res.json(Utilities.createAuthResponseValue(isValid, null, "Is user authenticated"));
    }, (err) => {
        Logger.error("/user/isauthenticated/:userid", err);
        res.json(Utilities.createAuthResponseValue(false, err));
    });
});

authRouter.route("/user/changepassword").put(passport.authorize("jwt"), (req: Request, res: Response) => {
    EmployeeModel.updateEmployeePasswordById(req["account"]._id, req.body.password).then(() => {
        res.json(Utilities.createAuthResponseValue(true, null, "Password change"));
    }, (err) => {
        res.json(Utilities.createAuthResponseValue(false, err));
    });
});

authRouter.route("/user/logout").post(passport.authorize("jwt"), (req: Request, res: Response) => {
    const token = req.header("Authorization");
    AuthenticationTokenLookupModel.removeToken(token).then(() => {
        res.json(Utilities.createAuthResponseValue(true, null, "User logged out"));
    }, (err) => {
        res.json(Utilities.createAuthResponseValue(false, err));
    });

});

authRouter.route("/user/token/refresh").get(passport.authorize("jwt"), (req: Request, res: Response) => {
    const token = req.header("Authorization");
    EmployeeModel.getEmployeeById(req["account"]._id).then((emp: IEmployee) => {
        res.json(createResponse(token, true, emp));
    }, (err) => {
        Logger.error("/user/token/refresh", err);
        res.json(Utilities.createAuthResponseValue(false, err));
    });
});

authRouter.route("/user/authenticate").post((req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;

    EmployeeModel.getEmployeeByUsername(username).then((emp) => {
        if (!emp) res.json({success: false, msg: "User not found"});

        EmployeeModel.comparePassword(password, emp.password).then((isMatch: boolean) => {
            res.json(createResponse(null, isMatch, emp));
        }, (err) => {
            Logger.error("/user/authenticate", err);
            res.json(Utilities.createAuthResponseValue(false, err));
        });
    }, (err) => {
        Logger.error("/user/authenticate", err);
        res.json(Utilities.createAuthResponseValue(false, err));
    });
});

authRouter.route("/user/generate/password").get(passport.authorize("jwt"), (req: Request, res: Response) => {
    res.json(Utilities.generatePassword());
});

function createResponse(currentToken: string, isMatch: boolean, emp: IEmployee): IAuthResponse {
    if (isMatch) {
        const id: string = emp._id;
        const name: string = `${emp.firstName} ${emp.lastName}`;
        const token: string = Utilities.generateJwtToken({
            user: {
                _id: id,
                name: name,
                isAdmin: emp.admin
            }
        }, 2500000);

        AuthenticationTokenLookupModel.setToken(currentToken, token, id).catch((err) => {
            Logger.error("createResponse", err);
        });

        return Utilities.createAuthResponseValue(true, name, "", token);
    } else {
        return Utilities.createAuthResponseValue(false, null, "Wrong password");
    }
}

export {authRouter};