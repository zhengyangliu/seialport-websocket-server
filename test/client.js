const WebSocket = require('ws');

// 打开一个 web socket  这里端口号和上面监听的需一致
var conn = new WebSocket('ws://localhost:3000/');

// Web Socket 已连接上，使用 send() 方法发送数据
conn.onopen = function () {
    
    var cmd = {};
    cmd.method = "open";
    var param = {};

    param.path = "COM3";
    param.baudRate = 9600;
    param.dataBits = 8;
    param.stopBits = 1;
    param.autoOpen = false;
    cmd.data = param;

    conn.send(JSON.stringify(cmd));
    
    var test = {};
    test.method = "write";
    test.data = "AAA";
    conn.send(JSON.stringify(test));
}

// 接收服务器发送的消息
conn.onmessage = function (msg) {
    // console.log(msg.data)

    var method = JSON.parse(msg.data).method;
    var data = JSON.parse(msg.data).data;
    // console.log(method);

    if (method === 'list') {
        console.log('list: ' + data);
    }
    else if (method === 'open-failed') {
        console.log('open-failed: ' + data);
    }
    else if (method === 'open-success') {
        console.log('open-success');
        port_state = 'on';
    }
    else if (method === 'recive') {
        console.log('recive: ' + data.data);
    }
    else if (method === 'unplug') {
        console.log('unplug');
    }
}
