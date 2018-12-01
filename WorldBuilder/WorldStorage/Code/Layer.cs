﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorldStorage.Code;

namespace WorldBuilder.Code
{
    public class Layer
    {
        public List<float> x;
        public List<float> y;
        public float size;
        public List<float> color;
        public string color_id;
        public List<Sprite> sprites;
        public List<Portal> portals;
    }
}
