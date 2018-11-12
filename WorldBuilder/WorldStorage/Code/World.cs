using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorldBuilder.Code;

namespace WorldStorage.Code
{
    public class World
    {
        public List<Layer> layers;
        public List<Portal> portals;
        public string name;
        public string planet_id;
    }
}
