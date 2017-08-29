import * as winston from "winston";

const Logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            name: "error-file",
            filename: "logs/errors.log",
            level: "error"
        }),
        new (winston.transports.File)({
            name: "info-file",
            filename: "logs/infos.log",
            level: "info"
        }),
        new (winston.transports.File)({
            name: "warning-file",
            filename: "logs/warnings.log",
            level: "warn"
        })
    ]
});

export default Logger;
