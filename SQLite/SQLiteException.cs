using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SQLitePluginNative.SQLite
{
    internal class SQLiteException : Exception
    {
        public SQLite3.Result Result { get; private set; }

        protected SQLiteException(SQLite3.Result r, string message)
            : base(message)
        {
            Result = r;
        }

        public static SQLiteException New(SQLite3.Result r, string message)
        {
            return new SQLiteException(r, message);
        }
    }

    internal class NotNullConstraintViolationException : SQLiteException
    {
        protected NotNullConstraintViolationException(SQLite3.Result r, string message)
            : base(r, message)
        {
        }

        public static new NotNullConstraintViolationException New(SQLite3.Result r, string message)
        {
            return new NotNullConstraintViolationException(r, message);
        }

    }
}
