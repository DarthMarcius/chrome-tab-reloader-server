"use strict";

//var WebSocketServer = require('websocketserver');
var WebSocketServer = require("nodejs-websocket")

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
        this.server = WebSocketServer.createServer((conn) => {
            console.log('Connection open on port' + port || 8001);
            this.isConnected = true;
            this.connection = conn;
            this.initListeners();
        }).listen(port || 8001);
    }

    refreshTab(uploadedFiles) {
        if (this.isConnected) {
            if (Array.isArray(uploadedFiles)) {
                uploadedFiles.forEach(function (el) {
                    this.connection.sendText(el.toString());
                }.bind(this));
            } else {
                this.connection.sendText(uploadedFiles ? uploadedFiles.toString() : 'reload');
            }
        } else {
            console.log('Tab can not be reloaded since browser ' + this.pluginName + ' plugin is not connected to server yet.');
        }
    }

    initListeners() {
        this.initSocketListeners();
    }

    initSocketListeners() {
        this.connection.on("close", (code, reason) => {
            this.isConnected = false;
            console.log(this.pluginName + ' connection is closed');
        });

        /*this.connection.on("text", (str) => {
            console.log("Received " + str)

            this.connection.sendText(str.toUpperCase()+"!!!")
        });*/
    }
};

module.exports = tabReloader;