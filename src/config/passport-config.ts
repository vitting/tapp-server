import * as passport from "passport";
import * as passportJwt from "passport-jwt";
import {VerifiedCallback} from "passport-jwt";
import {Express, Request} from "express-serve-static-core";
import {EmployeeModel} from "../models/employeeModel";
import {config} from "./config";
import Utilities from "../utilities";
import {AuthenticationTokenLookupModel} from "../models/authenticationModel";

export default class PassportConfig {
    static config(app: Express) {
        const options = {
            "jwtFromRequest": passportJwt.ExtractJwt.fromAuthHeader(),
            "secretOrKey": config.secretJwt,
            "passReqToCallback": true
        };

        // Called everytime a url is authenticated
        passport.use(new passportJwt.Strategy(options, (req: Request, jwt_payload: any, done: VerifiedCallback) => {
            const userId = jwt_payload.sub;
            const token = req.header("Authorization");

            AuthenticationTokenLookupModel.isTokenValidByUserId(token, userId).then((isTokenValid: boolean) => {
                if (!isTokenValid) {
                    return done(null, false);
                }

                EmployeeModel.getEmployeeById(userId).then((emp) => {
                    if (emp) {
                        return done(null, Utilities.stripPasswordFromObject(emp));
                    }

                    return done(null, false);
                }, (err) => {
                    return done(err, false);
                });
            });
        }));

        app.use(passport.initialize());
        app.use(passport.session());
    }
}