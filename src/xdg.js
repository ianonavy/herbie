var xdgBasedir = require('xdg-basedir');
var path = require('path');
var fs = require('fs');


var iconDimensions = [
	'scalable', '48x48', '64x64', '128x128', '192x192', '256x256',
	'32x32', '25x25', '16x16'
];


exports.forEachDataDir = function(callback) {
	for (var i = 0, len = xdgBasedir.dataDirs.length; i < len; i++) {
		var dataDir = xdgBasedir.dataDirs[i];
		callback(dataDir);
	}
}

exports.extractKey = function(contents, key) {
	var start = contents.indexOf(key + "=");
	var end = contents.indexOf("\n", start);
	var value = contents.substring(start + key.length + 1, end);
	return value;
}


exports.iconToPath = function(icon, dimensionOrder) {
	var possibleIcons = [];
	var dimensionOrder = dimensionOrder || iconDimensions;

	function findIcons(dataDir) {
		for (var i = 0, len = dimensionOrder.length; i < len; i++) {
			var dimension = dimensionOrder[i];
			var iconPath = path.join(
				dataDir, 'icons', 'hicolor', dimension, 'apps');
			if (fs.existsSync(iconPath)) {
				var icons = fs.readdirSync(iconPath);
				icons = icons.filter(function (filename) {
					return filename.indexOf(icon) != -1;
				});
				icons = icons.map(function (filename) {
					return path.join(iconPath, filename);
				});
				possibleIcons =possibleIcons.concat(icons);
			}
		}
	}
	exports.forEachDataDir(findIcons);

	if (possibleIcons.length > 0) {
		return possibleIcons[0];
	} else {
		return "http://placehold.it/48&text=no%20icon";
	}
}

