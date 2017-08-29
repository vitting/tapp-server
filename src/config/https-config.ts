import * as fs from "fs";

export default class HttpsOptions {
    static config() {
        return {
            key: fs.readFileSync("./certificates/key.pem"),
            cert: fs.readFileSync("./certificates/cert.pem")
        };
    }
}
