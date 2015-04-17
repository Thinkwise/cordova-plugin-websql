# WebSQL plugin for Apache Cordova (Windows Phone)
Enables WebSQL functionality on top of a Sqlite library. This repo is based on the [WebSQL plugin](https://github.com/MSOpenTech/cordova-plugin-websql) of MSOpenTech. This plugin however supports async execution of sql where the WebSQL plugin of MSOpenTech is completely sync.

## Usage
This plugin is used with the IndexedDBShim which can be found [here](https://github.com/axemclion/IndexedDBShim). This basically provides an IndexedDb interface on top of the WebSql interface.

## Installation guide
Add SDK references to the .Phone.jsproj:
```xml
<ItemGroup>
  <SDKReference Include="Microsoft.VCLibs, Version=12.0" />
</ItemGroup>
<ItemGroup>
  <SDKReference Include="SQLite.WP81, Version=3.8.8.1" />
</ItemGroup>
<Choose>
  <When Condition="$(Platform) == 'x86'">
    <ItemGroup>
      <Reference Include="SQLitePluginNative">
        <HintPath>..\..\plugins\cordova-plugin-websql-async\dist\x86\SQLitePluginNative.winmd</HintPath>
        <IsWinMDFile>true</IsWinMDFile>
      </Reference>
    </ItemGroup>
  </When>
  <When Condition="$(Platform) == 'ARM'">
    <ItemGroup>
      <Reference Include="SQLitePluginNative">
        <HintPath>..\..\plugins\cordova-plugin-websql-async\dist\ARM\SQLitePluginNative.winmd</HintPath>
        <IsWinMDFile>true</IsWinMDFile>
      </Reference>
    </ItemGroup>
  </When>
</Choose>
```
Add the following to expand the SDKReferenceDirectoryRoot. Its important that the XML is added right after the last Import element.
```xml
<!-- Last import element -->
<PropertyGroup>
  <SDKReferenceDirectoryRoot>
    ..\..\plugins\cordova-plugin-websql-async\src\windows\SDK\;$(SDKReferenceDirectoryRoot);
  </SDKReferenceDirectoryRoot>
</PropertyGroup>
```
## Build
The Windows and Windows Phone should be build separately. Note that the extra dashes are needed because of a bug in Apache Cordova.
```bash
cordova build windows --archs="x86 arm" -- --phone
cordova build windows -- --win
```
