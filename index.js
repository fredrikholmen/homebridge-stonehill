
var request = require('request');
const path = require('path');
var fs = require('fs');

var Service, Characteristic;

module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerPlatform("homebridge-stonehill", "Stonehill", StonehillSensorPlatform, false);
}


function StonehillSensorPlatform(log, config, api) {
  log("homebridge-stonehill Init");
  
  this.config = config || {};

  this.log = log;
  this.server = this.config.server || "No server provided";

  this.log("Stonehill Platform Plugin Version " + this.getVersion());
  this.log("Will attempt to collect data from ", this.server);
  
}

StonehillSensorPlatform.prototype = {

  accessories: function(callback) {
    this.log("Creating sensors...");
    var that = this;

    var foundAccessories = [];

    var accessory = new StonehillAccessory(that.log, {id: 1, name: "Outdoor", humidity: false});
    foundAccessories.push(accessory);

    var accessory = new StonehillAccessory(that.log, {id: 2, name: "Basement", humidity: true});
    foundAccessories.push(accessory);

    var accessory = new StonehillAccessory(that.log, {id: 3, name: "Living room", humidity: true});
    foundAccessories.push(accessory);


    callback(foundAccessories);

  },
  
  getVersion: function() {
    var pjPath = path.join(__dirname, './package.json');
    var pj = JSON.parse(fs.readFileSync(pjPath));
    return pj.version;
  }  
};

function StonehillAccessory(log, device) {
  this.log = log;
  this.id = device.id;
  this.name = device.name;
  this.humidity = device.humidity;
  this.manufacturername = "Made by Fredde";
}

StonehillAccessory.prototype = {

  getStateHumidity: function(callback){    
    callback(null, this.humidity);
  },

  getState: function (callback) {
    var sensor = this;

    var endPoint = 'http://' + sensor.server + ':5000/temperature/current';
    request(endPoint, function (error, response, body) {

      if (error) {
        sensor.log("HTTP function failed");
        callback(error);
      } else {
        sensor.log('HTTP power function succeeded!');
        var info = JSON.parse(body);
        
        temperatureService.setCharacteristic(Characteristic.CurrentTemperature, info[sensor.id-1].temp);

        if(sensor.humidity !== false)
          humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, info[sensor.id-1].hum);

        // sensor.log(body);
        // sensor.log(info);

        sensor.temperature = info[sensor.id-1].temp;
        if(sensor.humidity !== false)
          sensor.humidity = info[sensor.id-1].hum;

        callback(null, info[sensor.id-1].temp);
      }
    })

  },

  identify: function (callback) {
    this.log("Identify requested!");
        callback(); // success
      },

      getServices: function () {
        var services = [],
        informationService = new Service.AccessoryInformation();

        informationService
        .setCharacteristic(Characteristic.Manufacturer, this.manufacturername)
        services.push(informationService);

        temperatureService = new Service.TemperatureSensor(this.name);
        temperatureService
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getState.bind(this));
        services.push(temperatureService);
        
        if(this.humidity !== false){
          humidityService = new Service.HumiditySensor(this.name);
          humidityService
          .getCharacteristic(Characteristic.CurrentRelativeHumidity)
          .on('get', this.getStateHumidity.bind(this));
          services.push(humidityService);
        }

        return services;
      }
    };