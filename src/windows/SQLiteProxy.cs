using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.IO;
using System.Runtime.InteropServices.WindowsRuntime;
using SQLitePluginNative.SQLite;
using Windows.Foundation;
using System.Threading.Tasks;

namespace SQLitePluginNative
{
    public sealed class SQLiteProxy
    {

        private static Dictionary<long, SQLiteConnection> _dbConnections = new Dictionary<long, SQLiteConnection>();

        private static string getDbPath(string dbName)
        {
            string folder = Windows.Storage.ApplicationData.Current.LocalFolder.Path;
            return Path.Combine(folder, dbName);
        }

        public static string Connect(string dbName)
        {
            var result = new ConnectionInfo();
            try
            {
                var connection = new SQLite.SQLiteConnection(getDbPath(dbName));

                var newId = _dbConnections.Keys.DefaultIfEmpty(0).Max() + 1;
                _dbConnections.Add(newId, connection);
                result.Id = newId;
            }
            catch (Exception ex)
            {
                return Serialize(typeof(InvocationError), new InvocationError(ex));
            }

            return Serialize(typeof(ConnectionInfo), result);
        }

        public static string Disconnect(long connectionId)
        {
            try
            {
                var connection = _dbConnections[connectionId];
                connection.Close();
                _dbConnections.Remove(connectionId);
            }
            catch (Exception ex)
            {
                return Serialize(typeof(InvocationError), new InvocationError(ex));
            }
            return "{}";
        }

        public static IAsyncOperation<string> executeSql(long connectionId, [ReadOnlyArray()] object[] args)
        {
            return Task.Run<string>(() =>
            {
                try
                {
                    var query = (string)args[0];
                    var queryParams = (object[])args[1];

                    var connection = _dbConnections[connectionId];

                    var cmd = connection.CreateCommand(query, queryParams);
                    List<Dictionary<string, object>> rows = cmd.ExecuteQuery<Dictionary<string, object>>();

                    var resultSet = new SqlResultSet();
                    for (var i = 0; i < rows.Count; i++)
                    {
                        resultSet.Rows.Add(ReadResultSetRow(rows[i]));
                    }

                    resultSet.RowsAffected = SQLite3.Changes(connection.Handle);
                    resultSet.InsertId = SQLite3.LastInsertRowid(connection.Handle);
                    return Serialize(typeof(SqlResultSet), resultSet);
                }
                catch (Exception ex)
                {
                    // You can't access the original message text from JavaScript code.
                    // http://msdn.microsoft.com/en-US/library/windows/apps/br230301.aspx#ThrowingExceptions
                    // so we return it via custom object
                    return Serialize(typeof(InvocationError), new InvocationError(ex));
                }
            }).AsAsyncOperation();
        }

        private static QueryRow ReadResultSetRow(Dictionary<string, object> reader)
        {
            var row = new QueryRow();
            foreach (var kv in reader)
            {
                row.Add(new QueryColumn(kv.Key, kv.Value));
            }

            return row;
        }

        [DataContract]
        private class ConnectionInfo
        {
            [DataMember(Name = "connectionId")]
            public long Id;
        }

        private class QueryRow : List<QueryColumn> { }

        private class SqlResultSetRowList : List<QueryRow> { }

        [DataContract]
        private class SqlResultSet
        {
            [DataMember(Name = "insertId")]
            public long InsertId;
            [DataMember(Name = "rowsAffected")]
            public long RowsAffected;
            [DataMember(Name = "rows")]
            public readonly SqlResultSetRowList Rows = new SqlResultSetRowList();
        };

        [DataContract]
        private class QueryColumn
        {
            [DataMember]
            public string Key;
            [DataMember]
            public object Value;

            public QueryColumn(string key, object value)
            {
                Key = key;
                Value = value;
            }
        }

        [DataContract]
        private class InvocationError
        {
            [DataMember(Name = "message")]
            private string Message;

            [DataMember(Name = "code")]
            private int Code;

            public InvocationError(Exception ex)
            {
                Message = ex.Message;

                if (ex is SQLiteException)
                    Code = (int)((SQLiteException)ex).Result;
            }
        }

        private static string Serialize(Type type, object obj)
        {
            using (var stream = new MemoryStream())
            {
                var jsonSer = new DataContractJsonSerializer(type);
                jsonSer.WriteObject(stream, obj);
                stream.Position = 0;
                return new StreamReader(stream).ReadToEnd();
            }
        }

    }
}
