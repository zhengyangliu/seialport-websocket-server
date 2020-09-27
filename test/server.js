const server = require("../main")

try{
    server.start(3000);
} catch (err) {
    // 一般是由于端口已经被占用无法开启 ERR_SERVER_ALREADY_LISTEN
    console.error(err.code);
}