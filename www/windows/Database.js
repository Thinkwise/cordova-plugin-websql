/*
 * Copyright (c) Microsoft Open Technologies, Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
 */
var exec = require('cordova/exec'),
    SqlTransaction = require('./SqlTransaction');

var Database = function (name, version, displayName, estimatedSize, creationCallback) {
    // // Database openDatabase(in DOMString name, in DOMString version, in DOMString displayName, in unsigned long estimatedSize, in optional DatabaseCallback creationCallback
    // TODO: duplicate native error messages
    if (!name) {
        throw new Error('Database name can\'t be null or empty');
    }
    this.name = name;
    this.version = version; // not supported
    this.displayName = displayName; // not supported
    this.estimatedSize = estimatedSize; // not supported

    this.lastTransactionId = 0;

    this.Log('new Database(); name = ' + name);

    var that = this;

    function creationCallbackAsyncWrapper() {
        setTimeout(creationCallback, 0);
    }

    exec(creationCallbackAsyncWrapper, function (err) {
        that.Log('Database.open() err = ' + JSON.stringify(err));
    }, "WebSql", "open", [this.name]);
};

Database.prototype.Log = function (text) {
    if(window.__webSqlDebugModeOn === true)
        console.log('[Database] name: ' + this.name + ', lastTransactionId: ' + this.lastTransactionId + '. | ' + text);
};

Database.prototype.transaction = function (cb, onError, onSuccess, readOnly) {
    this.Log('transaction');

    if (typeof cb !== "function") {
        this.Log('transaction callback expected');
        throw new Error("transaction callback expected");
    }

    if (!readOnly) {
        readOnly = false;
    }

    var me = this;
    this.lastTransactionId++;

    var runTransaction = function () {
        var tx = new SqlTransaction(readOnly);
        tx.id = me.lastTransactionId;
        try {
            exec(function(res) {
                if (!res.connectionId) {
                    me.Log('transaction.run DB connection error');
                    throw new Error('Could not establish DB connection');
                }

                //me.Log('transaction.run.connectionSuccess, res.connectionId: ' + res.connectionId);
                tx.connectionId = res.connectionId;
            }, null, "WebSql", "connect", [me.name]);
        } catch (e) {
            if (onError) {
                onError();
            }
        }

        tx.executeSql('SAVEPOINT trx' + tx.id);
        tx.addCallbackToQueue(function () {
            try {
                cb(tx);
            } catch (cbEx) {
                me.Log('Database.prototype.transaction callback error; lastTransactionId = ' + JSON.stringify(me.lastTransactionId) + '; err = ' + JSON.stringify(cbEx));
                this.clearQueue();
            }
        });

        tx.addCallbackToQueue(function () {
            tx.executeSql('RELEASE trx' + tx.id);
        }, true);
        tx.addCallbackToQueue(function () {
            exec(null, null, "WebSql", "disconnect", [tx.connectionId]);
            if (onSuccess) {
                onSuccess();
            }
        }, true);

        setTimeout(function () {
            tx.executeNextItem();
        }, 0)
    }

    setTimeout(runTransaction, 0);
};

Database.prototype.readTransaction = function (cb, onError, onSuccess) {
    this.transaction(cb, onError, onSuccess, true);
};

module.exports = Database;
