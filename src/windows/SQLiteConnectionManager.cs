using SQLitePluginNative.SQLite;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SQLitePluginNative
{

    // This seems a bit dodgy but you can't open multiple connections to the same DB. But you can query it one connection with multiple commands (so it seems)
    // So this class is only used for some RefCounting on the connection
    internal class SQLiteConnectionManager
    {

        private static Dictionary<string, DBRefCounter> _dbConnectionsByString = new Dictionary<string, DBRefCounter>();
        private static Dictionary<long, DBRefCounter> _dbConnectionsById = new Dictionary<long, DBRefCounter>();

        private class DBRefCounter
        {
            public string Name;
            public SQLiteConnection connection;
            public int openConnections;
        }

        private static string getDbPath(string dbName)
        {
            string folder = Windows.Storage.ApplicationData.Current.LocalFolder.Path;
            return Path.Combine(folder, dbName);
        }

        public static long CreateConnection(string dbName)
        {
            var connection = new SQLite.SQLiteConnection(getDbPath(dbName));
            var newId = _dbConnectionsById.Keys.DefaultIfEmpty(0).Max() + 1;

            DBRefCounter counter;
            if (!_dbConnectionsByString.TryGetValue(dbName, out counter))
            {
                counter = new DBRefCounter()
                {
                    Name = dbName,
                    connection = connection,
                    openConnections = 1,
                };
                _dbConnectionsByString.Add(dbName, counter);
            }
            else
            {
                counter.openConnections++;
            }
            _dbConnectionsById.Add(newId, counter);
            return newId;
        }

        public static void CloseConnection(long connectionId)
        {
            var connection = _dbConnectionsById[connectionId];
            _dbConnectionsById.Remove(connectionId);
            connection.openConnections--;
            if (connection.openConnections == 0)
            {
                connection.connection.Close();
                _dbConnectionsByString.Remove(connection.Name);
            }
        }

        public  static SQLiteConnection GetConnecionById(long connectionId)
        {
            return _dbConnectionsById[connectionId].connection;
        }
    }
}
