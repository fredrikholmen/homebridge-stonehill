
var request = require('request');
const path = require('path');
var fs = require('fs');

var Service, Characteristic;

module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerPlatform("homebridge-stonehill", "Stonehill", StonehillSensPlatform, true);
}


function StonehillSensPlatform(log, config) {
  log("homebridge-stonehill Init");
  log(config);
  this.log = log;
  this.server = "raspberryPI.local";

  
  this.log("Stonehill Platform Plugin Version " + this.getVersion());
  
}

StonehillSensPlatform.prototype = {

  accessories: function(callback) {
    this.log("Fetching Sensors...");
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
    var that = this;
    request('http://192.168.1.4:5000/temperature/current', function (error, response, body) {

      if (error) {
        this.log("HTTP function failed");
        callback(error);
      } else {
        that.log('HTTP power function succeeded!');
        var info = JSON.parse(body);
        
        temperatureService.setCharacteristic(Characteristic.CurrentTemperature, info[that.id-1].temp);

        if(that.humidity !== false)
          humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, info[that.id-1].hum);

        that.log(body);
        that.log(info);

        that.temperature = info[that.id-1].temp;
        if(that.humidity !== false)
          that.humidity = info[that.id-1].hum;

        callback(null, info[that.id-1].temp);
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