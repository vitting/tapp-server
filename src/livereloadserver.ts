import * as path from "path";
import * as livereload from "livereload";
import Logger from "./logger";

let server = livereload.createServer({"delay": 2000});
server.watch(path.join(__dirname, "../client"));
Logger.info("Livereload server started");
