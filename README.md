herbie
======

0.1 beta

Shameless ripoff of [Alfred](http://www.alfredapp.com/). Inspired by [Mutate](https://github.com/qdore/Mutate), but built from Web technologies and designed for any GNU/Linux system. Currently pre-release software. Seriously, don't use this!

Requirements
------------

* nodejs>=0.10.33
* npm>=2.1.14
* node-webkit>=0.11.2

Installing
----------

Clone this repo, and `cd` into the directory. Then run:

    npm install

Run with `nw --enable-transparent-visuals --disable-gpu .`

I needed those flags to [get around some node-webkit transparency issues on Arch](https://github.com/rogerwang/node-webkit/issues/132#issuecomment-64943359). You may not need them.

Current Features
----------------

* Launch programs based on .desktop files
* That's it

Todo
----

* Modules/keyword-based scripting (based on JSON structure and keywords)
	* Load from an XDG config directory
	* Support any language for scripting
* Calculator module
* Google/DDG search module
* File search module
* Frequency-based ordering
* Better fuzzy matching programs
* Remember last query
* Preferences
	* User CSS
	* Customize shortcuts
	* Toggle number of items
	* GTK-based highlight colors
	* GTK-based theme...?
* Make less sketchy
* Documentation
* Tests

Screenshots
-----------

![Herbie](http://i.imgur.com/NDjVyrU.png)

License
-------

See LICENSE file.