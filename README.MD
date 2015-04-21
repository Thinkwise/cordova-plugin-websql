# WebSQL plugin for Apache Cordova (Windows Phone)
Enables WebSQL functionality on top of a SQLite library. This repo is based on the [WebSQL plugin](https://github.com/MSOpenTech/cordova-plugin-websql) of MSOpenTech. This plugin however supports async execution of sql where the WebSQL plugin of MSOpenTech is completely sync.

## Supported Platforms
This plugin only supports the `windows` platform, since most other platforms (`ios`, `android`, etc.) already support WebSQL natively.

You can also combine this plugin with the [asynchronous IndexedDB plugin](https://github.com/ABB-Austin/cordova-plugin-indexeddb-async).  Together, they  enable IndexedDB support for the `ios`, `android`, `windows`, and `browser` platforms.

## Installation
Install via the [Cordova CLI](https://cordova.apache.org/docs/en/edge/guide_cli_index.md.html).

For __Cordova CLI 4.x__, use the GIT URL syntax:

````bash
cordova plugin add https://github.com/Thinkwise/cordova-plugin-websql.git
````

For __Cordova CLI 5.x__, use the [new npm syntax](https://github.com/cordova/apache-blog-posts/blob/master/2015-04-15-plugins-release-and-move-to-npm.md):

````bash
cordova plugin add cordova-plugin-websql-async
````

Or just install the [asynchronous IndexedDB plugin](https://github.com/ABB-Austin/cordova-plugin-indexeddb-async), which automatically installs this plugin as a dependency.


## Build
The Windows and Windows Phone should be built separately. Note that the extra dashes are needed because of a bug in Apache Cordova.

````bash
cordova build windows --archs="x86 arm" -- --phone
cordova build windows -- --win
````
