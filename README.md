# homebridge-stonehill
This plugin exposes information from a REST endpoint as temperature and humidity characteristics. It's helpful for understanding how to roll-up several accessories in one platform.

## Install
	1. Install homebridge using: npm install -g homebridge
	2. Install this plugin using: git clone https://github.com/fredrikholmen/homebridge-stonehill.git
	3. Update your configuration file. See the sample below.
	4. Start homebridge using: homebridge -D -P ../homebridge-stonehill

## Configuration

Example config.json:

	{
	    "bridge": {
	        "name": "<Bridg name>",
	        "username": "<username>",
	        "port": <port>,
	        "pin": "<pin>"
	    },

	    "description": "This is an example configuration file with no accessories and one Stonehill platform. You can use this as a template for creating your own configuration file.

	    "accessories": [],

	    "platforms": [{
	        "platform": "Stonehill",
	        "name": "Stonehill",
	        "server": "<Your local REST server IP>"
	        }
	]
	}

## Remarks
The Homebridge package loads all plugins starting with homebridge- in its directory name. However, to be found you must point it to the directory that holds your plugin directories.
