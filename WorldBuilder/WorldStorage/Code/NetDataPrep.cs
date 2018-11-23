using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorldStorage.Controllers;

namespace WorldStorage.Code
{
    public class NetDataPrep
    {
        public async static Task<Tuple<double[][], double[][]>> PrepData()
        {
            MagicController magicCont = new MagicController();
            int magicCount = await magicCont.GetNumberAsync();
            if (magicCount == 0)
                throw new Exception("Data Prep failed");
            List<Tuple<string, string, string, string, int>> types = await magicCont.GetAsync(0, magicCount);
            if (types == null)
                throw new Exception("Data Prep failed");

            List<double[]> input = new List<double[]>();
            List<double[]> output = new List<double[]>();
            double[] temp;
            
            //prepare outputs
            for (int i = 0; i < magicCount; i++)
            {
                for (int j = 0; j < types[i].Item5; j++)
                {
                    temp = new double[magicCount];
                    temp[i] = 1;
                    output.Add(temp);
                }
            }

            //prepare inputs
            List<double[]> range;
            for (int i = 0; i < magicCount; i++)
            {
                range = await magicCont.GetDataByTypeAsync(types[i].Item1);
                if(range == null)
                    throw new Exception("Data Prep failed");
                input.AddRange(range);
            }

            return new Tuple<double[][], double[][]>(input.ToArray(), output.ToArray());
        }
    }
}
