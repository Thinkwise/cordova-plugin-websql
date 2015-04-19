# WebSQL plugin for Apache Cordova (Windows Phone)
Enables WebSQL functionality on top of a SQLite library. This repo is based on the [WebSQL plugin](https://github.com/MSOpenTech/cordova-plugin-websql) of MSOpenTech. This plugin however supports async execution of sql where the WebSQL plugin of MSOpenTech is completely sync.

## Usage
This plugin is intended to be combined with the [asynchronous IndexedDB plugin](https://github.com/ABB-Austin/cordova-plugin-indexeddb-async). This provides an IndexedDB interface on top of the WebSql interface.

## Installation
Install via the [Cordova CLI](https://cordova.apache.org/docs/en/edge/guide_cli_index.md.html).

````bash
cordova plugin add https://github.com/Thinkwise/cordova-plugin-websql.git
````

Or just install the [asynchronous IndexedDB plugin](https://github.com/ABB-Austin/cordova-plugin-indexeddb-async), which automatically installs this plugin as a dependency.


## Build
The Windows and Windows Phone should be built separately. Note that the extra dashes are needed because of a bug in Apache Cordova.

````bash
cordova build windows --archs="x86 arm" -- --phone
cordova build windows -- --win
````
