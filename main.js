/**
 * WebSoket服务器，接收网络指令来操作硬件串口。
 */
var ws = require('nodejs-websocket');
const SerialPort = require('serialport')

console.log("Start server")

var server = ws.createServer((conn) => {

    console.log("New connection")

    var port = {};

    conn.on("text", function (str) {

        // console.log(str);

        var method = JSON.parse(str).method;
        var data = JSON.parse(str).data;
        // console.log(method);
        // console.log(data);

        if (method === "list") {
            SerialPort.list().then(
                info => {
                    var msg = {};
                    msg.method = "list";
                    msg.data = info;
                    conn.sendText(JSON.stringify(msg));
                }
            )
        }
        else if (method === "open") {
            //设置串口参数
            port = new SerialPort(data.path, {
                baudRate: data.baudRate,
                dataBits: data.dataBits,
                stopBits: data.stopBits,
                autoOpen: data.autoOpen
            });

            //开启串口
            port.open(function (err) {
                if (err) {
                    // 开启失败
                    var msg = {};
                    msg.method = "open-failed";
                    msg.data = err.message;
                    conn.sendText(JSON.stringify(msg));
                    return;
                } else {
                    // 开启成功
                    var msg = {};
                    msg.method = "open-success";
                    conn.sendText(JSON.stringify(msg));

                    // 接收到数据
                    port.on('data', function (rev) {
                        var msg = {};
                        msg.method = "recive";
                        msg.data = rev;
                        conn.sendText(JSON.stringify(msg));
                    });
                    
                    // 定时检测串口状态防止设备被拔出
                    function portOpenWatcher() {
                        if (port.isOpen == false) {
                            clearInterval(interval);
                            var msg = {};
                            msg.method = "unplug";
                            conn.sendText(JSON.stringify(msg));
                        }
                    }
                    //启动定时扫描
                    var interval = setInterval(portOpenWatcher, 10); 
                }
            });
        }
        else if (method === "write") {
            // console.log(port);
            port.write(data, 'ascii', (err) => {
                if (err) {
                    // 发送失败
                    var msg = {};
                    msg.method = "write-failed";
                    msg.data = err.message;
                    conn.sendText(JSON.stringify(msg));
                    return;
                } else {
                    // 发送成功
                    var msg = {};
                    msg.method = "write-success";
                    conn.sendText(JSON.stringify(msg));
                }
            })
        }
        else if (method === "close") {
            port.close((err) => {
                if (err) {
                    // 关闭失败
                    var msg = {};
                    msg.method = "close-failed";
                    msg.data = err.message;
                    conn.sendText(JSON.stringify(msg));
                    return;
                } else {
                    // 开启成功
                    var msg = {};
                    msg.method = "close-success";
                    conn.sendText(JSON.stringify(msg));
                }
            })
        }
    })
    conn.on("close", (code, reason) => {
        console.log("Close connection")
    });
    conn.on("error", (code, reason) => {
        console.log("Connection closed abnormally")
    });
})

const start = (port) => {
    server.listen(port);
}

module.exports = {start};