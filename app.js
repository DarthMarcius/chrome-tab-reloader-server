"use strict";

//var WebSocketServer = require('websocketserver');
//var WebSocketServer = require("nodejs-websocket")
var WebSocket = require('ws');

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
        this.server = new WebSocket.Server({port: port || 8001});

        this.server.on('connection', (websocket) => {
            this.websocket = websocket;
            this.isConnected= true;

            this.initListeners();
        });
    }

    refreshTab(uploadedFiles) {
        if (this.isConnected) {
            if (Array.isArray(uploadedFiles)) {
                uploadedFiles.forEach(function (el) {
                    this.websocket.send(el.toString());
                }.bind(this));
            } else {
                this.websocket.send(uploadedFiles ? uploadedFiles.toString() : 'reload');
            }
        } else {
            console.log('Tab can not be reloaded since browser ' + this.pluginName + ' plugin is not connected to server yet.');
        }
    }

    initListeners() {
        this.websocket.on('message', (message) => {
            //console.log('received: %s', message);
            this.websocket.send('1');
        });

        this.server.on('close', () => {
            this.isConnected = false;
            console.log(this.pluginName + ' connection is closed');
        });
    }
};

module.exports = tabReloader;