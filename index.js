'use strict';

(function() {

var clj_fuzzy = require('clj-fuzzy');
var exec = require('child_process').exec;
var fs = require('fs');
var net = require('net');
var path = require('path');
var remote = require('remote');
var xdg = require('./xdg');


var CLEAR_SELECT = -1;
var results = document.getElementById("results");


// Execute arbitrary command, removing the XDG .desktop file specific stuff
// until we figure out what to do with them.
function executeCommand(path) {
	path = path.replace(/%[UufF]/g, "");
	console.log("Executing: " + path);
	exec(path);
}

// Reads a desktop file. Returns an object with an "exists" attribute as false
// if not found (because screw the idea of null!)
function fileToEntry(filename) {
	if (filename.indexOf(".desktop") != -1) {
		var contents = fs.readFileSync(filename).toString();
		var executable = xdg.extractKey(contents, "Exec");
		var title = xdg.extractKey(contents, "Name");
		var icon = xdg.extractKey(contents, "Icon");
		return {
			"title": title,
			"icon": xdg.iconToPath(icon),
			"path": executable,
			"exists": true
		}
	}
	return {"exists": false};
}

// Searches applciations directory under the data for .desktop files, and adds
// entry objects for each of them.
function getEntriesFromApplications(dataDir) {
	var entries = [];
	var dir = path.join(dataDir, 'applications');
	if (fs.existsSync(dir)) {
		var desktopFiles = fs.readdirSync(dir);
		for (var j= 0, len = desktopFiles.length; j < len; j++) {
			entries.push(fileToEntry(path.join(dir, desktopFiles[j])));
		}
	}
	return entries;
}

// Filters out the first 5 entries that match the query.
function getQueryResults(entries, query) {
	if (query === "") {""
		return [];
	}
	var lowerQuery = query.toLowerCase();

	function addScore(entry) {
		var lowerTitle = entry.title.toLowerCase();
		entry.score = clj_fuzzy.metrics.jaccard(lowerTitle, lowerQuery);
		return entry;
	}

	function entryMatches(entry) {
		if (!entry.exists) {
			return false;
		}
		var lowerTitle = entry.title.toLowerCase();
		var contains = lowerQuery.indexOf(lowerTitle) != -1;
		// Ignore any regex-related characters, but if the user's query is
		// abc, match anything that contains a substring of form "a*b*c"
		// For example, "gc" matches "Google Chrome".
		var regexString = lowerQuery.replace(/[\[\\\^\$\.\|\?\*\+\(\)]/g, '')
		                            .split("")
		                            .join(".*");
		var wildcardRegex = new RegExp(regexString, "i");
		var wildcardMatch = wildcardRegex.test(lowerTitle);
		return contains || wildcardMatch;
	}

	return entries.filter(entryMatches)
	              .map(addScore)
	              .sort(function (a, b) { return a.score - b.score; })
	              .slice(0, 5);
}

// Converts an entry number into a display string for the  appropriate shortcut.
// Currently hardcoded as "Return" for the first entry, and Alt+n for the nth
// entry. Should be configurable in the future.
function getShortcut(entryNumber) {
	if (entryNumber == 0) {
		return "\u23CE";  // return symbol
	} else {
		return "Alt+" + (entryNumber + 1);
	}
}

// Converts an entry object to HTML for display purposes
function entryToHTML(queryResult, entryNumber) {
	var elem = document.createElement("li");
	elem.className = "menu-item";

	var icon = document.createElement("img");
	icon.className = "icon";
	icon.src = queryResult.icon;

	var text = document.createElement("div");
	text.className = "text";

	var title = document.createElement("span");
	title.className = "title";
	title.appendChild(document.createTextNode(queryResult.title));
	text.appendChild(title);

	var path = document.createElement("span");
	path.className = "path";
	path.appendChild(document.createTextNode(queryResult.path));
	text.appendChild(path);

	var shortcut = document.createElement("span");
	shortcut.className = "shortcut";
	shortcut.appendChild(document.createTextNode(getShortcut(entryNumber)));

	elem.appendChild(icon);
	elem.appendChild(text);
	elem.appendChild(shortcut);

	elem.addEventListener('click', function (e) {
		executeCommand(queryResult.path);
	}, true);
	return elem;

}

// Updates the DOM with the entry objects
function updateResults(queryResults) {
	// Change elements
	while (results.hasChildNodes()) {
		results.removeChild(results.lastChild);
	}
	for (var i = 0, len = queryResults.length; i < len; i++) {
		var queryResult = queryResults[i];
		results.appendChild(entryToHTML(queryResult, i));
	}

	// Don't display footer if 1 or fewer elements.
	var footer = document.getElementById("footer");
	if (queryResults.length > 1) {
		footer.style.display = "block";
	} else {
		footer.style.display = "none";
	}
}

// Gets the selected application to run. If the user hit enter and something was
// highlighted via arrow keys, use that one. Otherwise, use the firs tone.
// If the user hit Alt+n, return n.
function getNumSelected(highlighted, e) {
	var selected = CLEAR_SELECT;
	// Enter
	if (e.keyCode == 13) {
		selected = highlighted == CLEAR_SELECT ? 1 : highlighted + 1;
	}
	// Alt + number
	var numPressed = parseInt(String.fromCharCode(e.keyCode), 10);
	if (e.altKey && !isNaN(numPressed)) {
		selected = numPressed;
	}
	return selected;
}

// Updates the DOM to reflect the current highlighted entry.
function updateHighlighted(highlighted) {
	var numEntries = results.childNodes.length;
	for (var i = 0; i < numEntries; i++) {
		results.childNodes[i].className = 'menu-item';
		if (i == highlighted) {
			results.childNodes[i].className += ' selected';
		}
	}
}

function listenForEscapeToClose(keyCode) {
	if (keyCode == 27) {  // escape
        var window = remote.getCurrentWindow();
        window.close();
	}
}

// Handles Enter or Alt+n keyboard shortcuts
function handleShortcuts(highlighted, displayedEntries, e) {
	var numSelected = getNumSelected(highlighted, e);  // 1-based
	if (numSelected != -1 && displayedEntries.length >= numSelected) {
		var selectedEntry = displayedEntries[numSelected - 1];
		var path = selectedEntry.path;
		executeCommand(path);
	}
}

function getHighlightChangedFromKeyPress(highlighted, keyCode) {
	if (keyCode == 40) {  // down arrow; increase the index value
		return Math.min(highlighted + 1, results.childNodes.length - 1);
	} else if (keyCode == 38) {  // up arrow; decrease the index value
		return Math.max(highlighted - 1, 0);
	} else if (keyCode != 13) {  // anything but Enter clears the selected
		return CLEAR_SELECT;
	} else {
		return highlighted;
	}
}

function main() {
	var searchTextbox = document.getElementById("search");
	var highlighted = -1;  // none
	var entries = [];
	xdg.forEachDataDir(function (dataDir) {
		entries = entries.concat(getEntriesFromApplications(dataDir));
	});
	var displayedEntries = [];

	document.addEventListener('mouseover', function (e) {
		if (e.target.className.indexOf('menu-item') != -1) {
			highlighted = Array.prototype.indexOf.call(
				results.childNodes, e.target);
			updateHighlighted(highlighted);
		}
	}, true);

	document.addEventListener('keyup', function (e) {
		listenForEscapeToClose(e.keyCode);
		highlighted = getHighlightChangedFromKeyPress(highlighted, e.keyCode);
		handleShortcuts(highlighted, displayedEntries, e);
		if (e.target == searchTextbox) {
			var query = e.target.value;
			displayedEntries = getQueryResults(entries, query);
		}
		updateResults(displayedEntries);
		updateHighlighted(highlighted);
	}, true);

    document.body.style.display = "block";
}

setTimeout(main, 100);

})();
