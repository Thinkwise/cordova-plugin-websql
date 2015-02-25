using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SQLitePluginNative.SQLite
{
    /// <summary>
    /// Custom code, you won't find this here: https://github.com/praeclarum/sqlite-net
    /// </summary>
    internal class SQLiteTypeConverter
    {

        public static Type convertTypeToCLRType(SQLite3.ColType colType)
        {
            switch (colType)
            {
                case SQLite3.ColType.Blob:
                    return typeof(byte[]);
                case SQLite3.ColType.Float:
                    return typeof(float);
                case SQLite3.ColType.Integer:
                    return typeof(int);
                case SQLite3.ColType.Text:
                    return typeof(string);
                case SQLite3.ColType.Null:
                default:
                    return typeof(string);
            }
        }
    }
}
