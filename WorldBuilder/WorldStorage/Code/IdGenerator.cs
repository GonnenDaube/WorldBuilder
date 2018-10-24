using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorldStorage.Code
{
    public static class IdGenerator
    {
        public static string GenerateID()
        {
            return Guid.NewGuid().ToString("N");
        }
    }
}
