var path        = require('path'),
    fs          = require('fs'),
    pluginPath  = '',
    windowsPath = '';

/**
 * This script modifies the Windows Phone project to work with SQLite.
 */
module.exports = function(context) {
    try {
        pluginPath = context.opts.plugin.pluginInfo.dir;
        windowsPath = path.join(context.opts.projectRoot, 'platforms', 'windows');
        modifySolutionFile();
        modifyProjectFile();
    }
    catch (e) {
        var err = new Error('An error occurred while adding SQLite to the Windows Phone project');
        err.stack = e.stack;
        throw err;
    }
};


/**
 * Modifies the Windows solution to work with SQLite.
 */
function modifySolutionFile() {
    var solutionFilePath = path.join(windowsPath, 'CordovaApp.sln');
    console.log('Adding SQLite to the Windows solution (%s)', solutionFilePath);

    var sln = fs.readFileSync(solutionFilePath, {encoding: 'utf8'});
    sln = limitSolutionConfigurations(sln);
    fs.writeFileSync(solutionFilePath, sln);
}


/**
 * Limits the Windows Phone project's configurations to ARM and x86, 
 * which are the only ones supported by SQLite.
 */
function limitSolutionConfigurations(sln) {
    var winPhoneProjGuid = '31B67A35-9503-4213-857E-F44EB42AE549';
    if (sln.indexOf(winPhoneProjGuid) === -1) {
        throw new Error('Unable to find the Windows Phone project GUID in the solution file');
    }

    var regex = new RegExp('(\\{' + winPhoneProjGuid + '\\})\\.(Debug|Release)\\|(Any CPU|x64)\\.(ActiveCfg|Build\\.0|Deploy\\.0) \\= (Debug|Release)\\|(Any CPU|x64)', 'g');
    return sln.replace(regex, '$1.$2|$3.$4 = $5|x86');
}


/**
 * Modifies the Windows Phone project to work with SQLite.
 */
function modifyProjectFile() {
    var projectFilePath = path.join(windowsPath, 'CordovaApp.Phone.jsproj');
    console.log('Adding SQLite to the Windows Phone project (%s)', projectFilePath);

    var xml = fs.readFileSync(projectFilePath, {encoding: 'utf8'});
    xml = limitProjectConfigurations(xml);
    xml = addSQLiteReferences(xml);
    fs.writeFileSync(projectFilePath, xml);
}


/**
 * Limits the Windows Phone project's configurations to ARM and x86, 
 * which are the only ones supported by SQLite.
 */
function limitProjectConfigurations(xml) {
    // Find the ProjectConfigurations section in the project file
    var configsStartTag = '<ItemGroup Label="ProjectConfigurations">';
    var configsEndTag = '</ItemGroup>';
    var configsStart = xml.lastIndexOf(configsStartTag);
    var configsEnd = xml.indexOf(configsEndTag, configsStart);
    if (configsStart === -1 || configsEnd === -1) {
        throw new Error('Unable to find the <ItemGroup Label="ProjectConfigurations"> element in the project file');
    }
    configsStart += configsStartTag.length;

    // Add project configurations
    var configsPath = path.join(pluginPath, 'src', 'windows', 'configurations.xml');
    var configs = fs.readFileSync(configsPath, {encoding: 'utf8'});
    return xml.substring(0, configsStart) + '\n' + configs + xml.substring(configsEnd);
}


/**
 * Adds references to SQLite to the Windows Phone project file
 */
function addSQLiteReferences(xml) {
    // Don't do anything if the references are already in the file
    if (xml.indexOf('cordova-plugin-websql-async') !== -1) {
        return xml;
    }

    // Find the last <Import/> element in the project file
    var lastImportStart = xml.lastIndexOf('<Import ');
    var lastImportEnd = xml.indexOf('/>', lastImportStart);
    if (lastImportStart === -1 || lastImportEnd === -1) {
        throw new Error('Unable to find an <Import/> element in the project file');
    }
    lastImportEnd += 2;

    // Add SQLite references
    var referencesPath = path.join(pluginPath, 'src', 'windows', 'references.xml');
    var references = fs.readFileSync(referencesPath, {encoding: 'utf8'});
    return xml.substring(0, lastImportEnd) + '\n' + references + xml.substring(lastImportEnd);
}

