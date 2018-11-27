using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Encog;
using Encog.Engine.Network.Activation;
using Encog.ML.Data;
using Encog.ML.Data.Basic;
using Encog.ML.Train;
using Encog.Neural.Networks;
using Encog.Neural.Networks.Layers;
using Encog.Neural.Networks.Training.Propagation.Resilient;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorldStorage.Code;

namespace WorldStorage.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class NetworkController : Controller
    {
        [HttpPost, Authorize]
        public async Task<int> PostAsync(string name, int hidden_count, int hidden_length)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                List<Tuple<string, string>> res = new List<Tuple<string, string>>();
                await connection.OpenAsync();
                string query = "INSERT INTO [Networks] VALUES(@id, @time, @name, 0, @hidden_count, @hidden_length, NULL, 0);";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", IdGenerator.GenerateID());
                sqlCommand.Parameters.AddWithValue("@time", DateTime.Now);
                sqlCommand.Parameters.AddWithValue("@name", name);
                sqlCommand.Parameters.AddWithValue("@hidden_count", hidden_count);
                sqlCommand.Parameters.AddWithValue("@hidden_length", hidden_length);
                await sqlCommand.ExecuteNonQueryAsync();
                connection.Close();
                return 1;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return 0;
            }
        }

        [HttpGet, Authorize]
        public async Task<List<Tuple<string, string, double>>> GetAsync(int offset, int ammount)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                List<Tuple<string, string, double>> res = new List<Tuple<string, string, double>>();
                string id, name;
                double suc_rate;
                await connection.OpenAsync();
                string query = "SELECT n.network_id, n.name, n.success_rate FROM [Networks] as n ORDER BY n.train_date DESC OFFSET @offset ROWS FETCH NEXT @ammount ROWS ONLY;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@offset", offset);
                sqlCommand.Parameters.AddWithValue("@ammount", ammount);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                while (reader.Read())
                {
                    id = (string)reader["network_id"];
                    name = (string)reader["name"];
                    suc_rate = (double)reader["success_rate"];
                    res.Add(new Tuple<string, string, double>(id, name, suc_rate));
                }
                reader.Close();
                connection.Close();
                return res;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return null;
            }
        }

        [HttpGet, Authorize]
        public async Task<int> GetNumberAsync()
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                int res = 0;
                await connection.OpenAsync();
                string query = "SELECT COUNT(n.network_id) FROM [Networks] as n;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                if (reader.Read())
                {
                    res = reader.GetInt32(0);
                }
                reader.Close();
                connection.Close();
                return res;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return 0;
            }
        }

        [HttpDelete, Authorize]
        public async Task<int> DeleteAsync(string id)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                int res = 0;
                await connection.OpenAsync();
                string query = "DELETE FROM [NetworkMagics] WHERE network_id = @id";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                await sqlCommand.ExecuteNonQueryAsync();

                query = "DELETE FROM [Networks] WHERE network_id = @id;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                res = await sqlCommand.ExecuteNonQueryAsync();
                
                connection.Close();
                return res;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return 0;
            }
        }

        [HttpPut]
        public async Task<int> TrainNetwork(string id)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                Tuple<double[][], double[][]> data = await NetDataPrep.PrepData();
                double[][] input = data.Item1;
                double[][] output = data.Item2;
                List<int> n_Count = new List<int>();

                int hidden_count = 0, hidden_length = 0;
                bool trained = false;
                string netData = "";
                DateTime trainDate = DateTime.Now;
                bool upToDate;

                await connection.OpenAsync();
                string query = "SELECT n.hidden_count, n.hidden_length, n.trained, n.data, n.train_date FROM [Networks] as n WHERE n.network_id = @id;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                if (reader.Read())
                {
                    hidden_count = reader.GetInt32(0);
                    hidden_length = reader.GetInt32(1);
                    trained = reader.GetBoolean(2);
                    netData = !reader.IsDBNull(3) ? reader.GetString(3) : "";
                    trainDate = reader.GetDateTime(4);
                }
                reader.Close();
                connection.Close();

                upToDate = await new MagicController().UpToDate(trainDate);

                BasicNetwork network;

                if(trained && upToDate)
                {//if training can be "Added"
                    network = LoadNetwork(netData, input[0].Length, output[0].Length, hidden_count, hidden_length);   
                }
                else
                {//if network needs to be recreated
                    network = GenNetwork(input[0].Length, output[0].Length, hidden_count, hidden_length);
                }


                //training proccess
                Train(network, input, output);

                //Evaluation proccess
                int num = 0;
                float success_rate;
                IMLData op;
                IMLDataSet trainingSet = new BasicMLDataSet(input, output);
                foreach(IMLDataPair pair in trainingSet)
                {
                    op = network.Compute(pair.Input);
                    if (FindMax(op) == FindMax(pair.Ideal))
                        num++;
                }
                success_rate = (float)num / input.Length;

                //saving proccess
                netData = SaveNetwork(network);

                await connection.OpenAsync();
                int res;
                query = "UPDATE [Networks] SET train_date = @date, trained = 1, data = @data, success_rate = @suc_rate WHERE network_id = @id;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                sqlCommand.Parameters.AddWithValue("@date", DateTime.Now);
                sqlCommand.Parameters.AddWithValue("@data", netData);
                sqlCommand.Parameters.AddWithValue("@suc_rate", success_rate);
                res = await sqlCommand.ExecuteNonQueryAsync();

                query = "DELETE FROM [NetworkMagics] WHERE network_id = @id;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                await sqlCommand.ExecuteNonQueryAsync();

                query = "INSERT INTO [NetworkMagics] (network_id, magic_type) SELECT @id, m.magic_type FROM [MagicTypes] AS m ORDER BY m.create_time DESC;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                await sqlCommand.ExecuteNonQueryAsync();

                EncogFramework.Instance.Shutdown();

                connection.Close();

                return res;
            }
            catch(Exception e)
            {
                Console.WriteLine(e.Message);
                return 0;
            }
        }

        private string SaveNetwork(BasicNetwork network)
        {
            double[] data = new double[network.EncodedArrayLength()];
            network.EncodeToArray(data);
            List<byte> netData = new List<byte>();
            foreach (double d in data)
            {
                netData.AddRange(BitConverter.GetBytes(d));
            }
            return Convert.ToBase64String(netData.ToArray());
        }

        private BasicNetwork GenNetwork(int input, int output, int h_c, int h_l)
        {
            BasicNetwork network = new BasicNetwork();
            network.AddLayer(new BasicLayer(null, true, input));
            for (int i = 0; i < h_c; i++)
            {
                network.AddLayer(new BasicLayer(new ActivationSigmoid(), true, h_l));
            }
            network.AddLayer(new BasicLayer(new ActivationSigmoid(), false, output));
            network.Structure.FinalizeStructure();
            network.Reset();
            return network;
        }

        private BasicNetwork LoadNetwork(string netData, int input, int output, int h_c, int h_l)
        {
            byte[] byteData = Convert.FromBase64String(netData);
            double[] data = new double[byteData.Length / 8];
            Buffer.BlockCopy(byteData, 0, data, 0, byteData.Length);
            BasicNetwork network = GenNetwork(input, output, h_c, h_l);
            network.DecodeFromArray(data);
            return network;
        }

        private int FindMax(IMLData arr)
        {
            int max = 0;
            for(int i = 0; i < arr.Count; i++)
            {
                if (arr[max] < arr[i])
                    max = i;
            }
            if (max < 0.0)
                return -1;
            return max;
        }

        private void Train(BasicNetwork network, double[][] input, double[][] output)
        {
            IMLDataSet trainingSet = new BasicMLDataSet(input, output);
            IMLTrain train = new ResilientPropagation(network, trainingSet);

            int epoch = 1;

            do
            {
                train.Iteration();
                epoch++;
            } while (train.Error > 0.05);

            train.FinishTraining();
        }

        [HttpGet]
        public async Task<Network> GetNetworkAsync(string id)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                string data = "";
                int h_c = 0, h_l = 0, output = 0;
                await connection.OpenAsync();
                string query = "SELECT n.data, n.hidden_count, n.hidden_length as output FROM [Networks] as n WHERE n.network_id = @id;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                if (reader.Read())
                {
                    data = reader.GetString(0);
                    h_c = reader.GetInt32(1);
                    h_l = reader.GetInt32(2);
                }
                reader.Close();
                connection.Close();
                return new Network(data, h_c, h_l);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return null;
            }
        }
    }
}