const config = {
    mongoDbUrlDev: "mongodb://localhost/tapp",
    mongoDbUrlProd: "mongodb://localhost/tapp",
    secretJwt: "3mand2heste1kanin",
    sessionSecret: "7ugler4fugle8fisk",
    sessionTimeout: 3600000,
    chatSocketPath: "/socket/chat",
    commonSocketPath: "/socket/common",
    notifyRefreshInterval: 30000,
    httpPort: 3000,
    httpsPort: 3001
};

export {config};