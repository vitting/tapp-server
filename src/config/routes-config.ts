import {Express, NextFunction, Request, Response} from "express-serve-static-core";
import {authRouter} from "../routes/authRoutes";
import {employeeRouter} from "../routes/employeeRoutes";
import {taskRouter} from "../routes/taskRoutes";
import Logger from "../logger";
import {employeeAdminRouter} from "../routes/admin/employeeAdminRoutes";
import {isAdminRouter} from "../routes/admin/isAdminMiddelware";
import {testRouter} from "../routes/testRoutes";
import {customerAdminRouter} from "../routes/admin/customerAdminRoutes";

export class RoutesConfig {
    static config(app: Express) {
        app.use("/api/test", testRouter);
        app.use("/api", taskRouter);
        app.use("/api", employeeRouter);
        app.use("/api", authRouter);
        app.use("/api/admin", isAdminRouter);
        app.use("/api/admin", employeeAdminRouter);
        app.use("/api/admin", customerAdminRouter);
        app.get("/api/*", (req: Request, res: Response) => {
            res.sendStatus(404);
        });

        app.get("*", (req: Request, res: Response) => {
            Logger.warn("Route not found", req.originalUrl);
            res.send("Route not found");
        });

        app.use((req: Request, res: Response, next: NextFunction) => {
            let err = new Error("Not Found");
            err["status"] = 404;
            next(err);
        });

        if (process.env.NODE_ENV === "development") {
            app.use((err: Error, req: Request, res: Response) => {
                Logger.error(err.message);
                res.status(err["status"] || 500);
                res.send(err.message);
            });
        }

        app.use((err: Error, req: Request, res: Response) => {
            Logger.error(err.message);
            res.status(err["status"] || 500);
            res.send(err.message);
        });
    }
}