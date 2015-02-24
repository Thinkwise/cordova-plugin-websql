using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SQLitePluginNative.SQLite
{
    internal class TableMapping
    {
        internal class Column
        {

            public string Name { get; private set; }
            public Type ColumnType { get; private set; }

            public Column(string name, Type type)
            {
                this.Name = name;
                this.ColumnType = type;
            }

            public void SetValue(IDictionary<string, object> obj, object val)
            {
                obj[this.Name] = val;
            }

            public object GetValue(IDictionary<string, object> obj)
            {
                return obj[this.Name];
            }
        }
    }
}
