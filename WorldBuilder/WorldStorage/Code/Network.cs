using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorldStorage.Code
{
    public class Network
    {
        public string data;
        public int hidden_count;
        public int hidden_length;
        public int output;

        public Network(string data, int hidden_count, int hidden_length, int output)
        {
            this.data = data;
            this.hidden_count = hidden_count;
            this.hidden_length = hidden_length;
            this.output = output;
        }
    }
}
