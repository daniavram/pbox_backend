/**
 * MqttController
 *
 * @description :: Server-side logic for subscribing to the SmartLiving broker using MQTT
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var boxController = require('./BoxController.js');

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.smartliving.io', {port: 1883, username: 'daniavram:daniavram', password: 'tcndvrfznop', clientId: 'PdgYKiVwn3bErbb0HVQRk2'});

client.on('connect', function () {
    client.subscribe('client/daniavram/in/device/*/asset/100/state');
    console.log('Subscribed to MQTT client: ' + client.options.clientId);
});
    
client.on('message', function(topic, message) {
    
    var boxId = topic.match(/.*?\/(\w+)\/asset\//);
    if (boxId != null) {
        boxController.boxButtonPressed(boxId[1]);
    }
    
});