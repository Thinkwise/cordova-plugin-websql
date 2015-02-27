/*
 * Copyright (c) Microsoft Open Technologies, Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
 */
var exec = require('cordova/exec'),
    WRITE_OPS_REGEX = /^\s*(?:create|drop|delete|insert|update)\s/i;

// http://www.w3.org/TR/webdatabase/#sqltransaction
var SqlTransaction = function (readOnly, onError) {
    this.readOnly = readOnly;
    //this.Log('ctor');
    this.onError = onError;
    this.queue = [];
    this.internalQueue = [];
};
SqlTransaction.prototype.clearQueue = function () {
    this.queue = [];
}
SqlTransaction.prototype.clearInternalQueue = function () {
    this.internalQueue = [];
}

SqlTransaction.prototype.executeError = function (lastError) {
    var onError = this.onError;
    if (onError) {
        // Clear error , to make sure we are not coming back here ever!
        this.onError = null;
        onError(lastError);
    }
}
SqlTransaction.prototype.Log = function (text) {
    if (window.__webSqlDebugModeOn === true)
        console.log('[SqlTransaction] id: ' + this.id + ', connectionId: ' + this.connectionId + '. | ' + text);
};
SqlTransaction.prototype.executeSqlInternal = function (sql, params, onSuccess, onError) {
    if (!sql) {
        this.Log('executeSql, ERROR: sql query can\'t be null or empty');
        throw new Error('sql query can\'t be null or empty');
    }
    if (typeof (this.connectionId) == 'undefined' || this.connectionId <= 0) {
        this.Log('executeSql, ERROR: Connection is not set');
        throw new Error('Connection is not set');
    }
    if (this.readOnly && WRITE_OPS_REGEX.test(sql)) {
        this.Log('executeSql, ERROR: Read-only transaction can\'t include write operations');
        throw new Error('Read-only transaction can\'t include write operations');
    }
    var me = this;
    var rollbackRequired = false;
    var lastError;
    params = params || [];
    var successCallback = function (res) {
        // add missing .item() method as per http://www.w3.org/TR/webdatabase/#sqlresultset
        res.rows.item = function (index) {
            if (index < 0 || index >= res.rows.length) {
                return null;
            }
            return res.rows[index];
        };
        // process rows to be W3C spec compliant; TODO - this must be done inside native part for performance reasons
        for (idxRow = 0; idxRow < res.rows.length; idxRow++) {
            var originalRow = res.rows[idxRow],
                refinedRow = {},
                idxColumn;
            res.rows[idxRow] = refinedRow;
            for (idxColumn in originalRow) {
                refinedRow[originalRow[idxColumn].Key] = originalRow[idxColumn].Value;
            }
        }
        if (onSuccess) {
            try {
                onSuccess(me, res);
            } catch (e) {
                if (onError) {
                    try {
                        rollbackRequired = onError(me, e);
                    } catch (errCbEx) {
                        me.Log("Error occured while executing error callback: " + errCbEx + "; query: " + sql);
                        rollbackRequired = true;
                    }
                } else {
                    rollbackRequired = true;
                }
                lastError = e;
                if (rollbackRequired !== false) {
                    me.Log("Error occured while executing sql: " + sql + '. Error: ' + lastError);
                    me.executeError(lastError);
                }
            }
        }
    };
    var errorCallback = function (error) {
        if (onError) {
            try {
                rollbackRequired = onError(me, error);
            } catch (errCbEx) {
                me.Log("Error occured while executing error callback: " + errCbEx);
                rollbackRequired = true;
            }
        } else {
            rollbackRequired = true;
        }
        lastError = error;
        if (rollbackRequired !== false) {
            me.Log("Error occured while executing sql: " + sql + '. Error: ' + lastError);
            me.executeError(lastError);
        }
    };
    exec(function (res) {
        successCallback(res);
        me.executeNextItem();
    }, function (error) {
        errorCallback(error);
        me.executeNextItem();
    }, "WebSql", "executeSql", [me.connectionId, sql, params]);
};
SqlTransaction.prototype.executeNextItem = function () {
    var queue = (this.queue.length > 0 ? this.queue : this.internalQueue);
    if (queue.length > 0) {
        var func = queue.shift();
        func();
    }
}
SqlTransaction.prototype.executeSql = function (sql, params, onSuccess, onError) {
    var that = this;
    this.queue.push(function () {
        that.executeSqlInternal(sql, params, onSuccess, onError);
    })
};
SqlTransaction.prototype.addCallbackToQueue = function (func, useInternalQueue) {
    var that = this;
    var queue = (useInternalQueue ? this.internalQueue : this.queue);
    queue.push(function () {
        func();
        that.executeNextItem();
    })
};
module.exports = SqlTransaction;