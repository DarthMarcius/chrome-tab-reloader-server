"use strict";

//var WebSocketServer = require('websocketserver');
//var WebSocketServer = require("nodejs-websocket")
var WebSocketServer = require('websocket').server,
    http = require('http');

class tabReloader {
    constructor(options) {
        this.options = options;
        this.server = false;
        this.pluginName = 'Tab Reloader';
        this.isConnected = false;
        this.connection = false;

        this.init();

        return this.refreshTab.bind(this);
    }

    init() {
        var port = this.options ? this.options.port : false;
        this.server = http.createServer(function(request, response) {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        }).listen(port || 8001, function() {
            console.log((new Date()) + (port || 8001));
        });

        wsServer = new WebSocketServer({
            httpServer: server,
            autoAcceptConnections: false
        });

        wsServer.on('request', (request) => {
            if (!this.originIsAllowed(request.origin)) {
                // Make sure we only accept requests from an allowed origin
                request.reject();
                console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
                return;
            }
            
            this.connection = request.accept('echo-protocol', request.origin);
            console.log((new Date()) + ' Connection accepted.');

            this.initListeners()
        });
    }

    originIsAllowed(origin) {
        // put logic here to detect whether the specified origin is allowed.
        return true;
    }

    refreshTab(uploadedFiles) {
        if (this.isConnected) {
            if (Array.isArray(uploadedFiles)) {
                uploadedFiles.forEach(function (el) {
                    this.connection.sendUTF(el.toString());
                }.bind(this));
            } else {
                this.connection.sendUTF(uploadedFiles ? uploadedFiles.toString() : 'reload');
            }
        } else {
            console.log('Tab can not be reloaded since browser ' + this.pluginName + ' plugin is not connected to server yet.');
        }
    }

    initListeners() {
        this.connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log('Received Message: ' + message.utf8Data);
                this.connection.sendUTF(message.utf8Data);
            } else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                this.connection.sendBytes(message.binaryData);
            }
        });

        this.connection.on('close', function(reasonCode, description) {
            this.isConnected = false;
            console.log(this.pluginName + ' connection is closed');
        });
    }
};

module.exports = tabReloader;