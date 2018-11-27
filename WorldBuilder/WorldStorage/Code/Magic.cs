using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorldStorage.Code
{
    public class Magic
    {
        public string id;
        public string name;
        public List<double> baseline;
        public string image;

        public Magic(string id, string name, string baseline, string image)
        {
            this.id = id;
            this.name = name;
            List<Point> points = JsonConvert.DeserializeObject<List<Point>>(baseline);
            this.baseline = new List<double>();
            foreach(Point p in points)
            {
                this.baseline.Add(p.x);
                this.baseline.Add(p.y);
            }
            this.image = image;
        }
    }
}
