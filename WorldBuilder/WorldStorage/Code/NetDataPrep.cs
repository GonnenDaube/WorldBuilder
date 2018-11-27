using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorldStorage.Controllers;

namespace WorldStorage.Code
{
    public class NetDataPrep
    {
        //public async static Task<Tuple<double[][], double[][]>> PrepData()
        //{
        //    MagicController magicCont = new MagicController();
        //    int magicCount = await magicCont.GetNumberAsync();
        //    if (magicCount == 0)
        //        throw new Exception("Data Prep failed");
        //    List<Tuple<string, string, string, string, int>> types = await magicCont.GetAsync(0, magicCount);
        //    if (types == null)
        //        throw new Exception("Data Prep failed");

        //    List<double[]> input = new List<double[]>();
        //    List<double[]> output = new List<double[]>();
        //    double[] temp;
            
        //    //prepare outputs
        //    for (int i = 0; i < magicCount; i++)
        //    {
        //        for (int j = 0; j < types[i].Item5; j++)
        //        {
        //            temp = new double[magicCount];
        //            temp[i] = 1;
        //            output.Add(temp);
        //        }
        //    }

        //    //prepare inputs
        //    List<double[]> range;
        //    for (int i = 0; i < magicCount; i++)
        //    {
        //        range = await magicCont.GetSampleData(types[i].Item1);
        //        if(range == null)
        //            throw new Exception("Data Prep failed");
        //        input.AddRange(range);
        //    }

        //    return new Tuple<double[][], double[][]>(input.ToArray(), output.ToArray());
        //}

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

            int sampleCount = await magicCont.GetSamplesCount();
            double[] temp;

            //prepare outputs
            for(int i = 0; i < magicCount; i++)
            {
                for(int j = 0; j < i; j++)
                {
                    for(int k = 0; k < types[j].Item5; k++)
                    {
                        temp = new double[1];
                        temp[0] = 0;
                        output.Add(temp);
                    }
                }

                for (int j = 0; j < types[i].Item5; j++)
                {
                    temp = new double[1];
                    temp[0] = 1;
                    output.Add(temp);
                }

                for (int j = i + 1; j < types.Count; j++)
                {
                    for (int k = 0; k < types[j].Item5; k++)
                    {
                        temp = new double[1];
                        temp[0] = 0;
                        output.Add(temp);
                    }
                }
            }

            //prepare inputs
            List<List<double>> samples = await magicCont.GetSampleData();
            List<double> record;
            List<double> baseline;
            for (int i = 0; i < magicCount; i++)
            {
                baseline = GetBaseline(types[i].Item4);
                foreach(List<double> sample in samples)
                {
                    record = new List<double>();
                    record.AddRange(sample);
                    record.AddRange(baseline);
                    input.Add(record.ToArray());
                }
            }

            return new Tuple<double[][], double[][]>(input.ToArray(), output.ToArray());
        }

        private static List<double> GetBaseline(string baseline)
        {
            List<double> data = new List<double>();
            List<Point> p = JsonConvert.DeserializeObject<List<Point>>(baseline);
            foreach (Point point in p)
            {
                data.Add(point.x);
                data.Add(point.y);
            }
            return data;
        }
    }
}
