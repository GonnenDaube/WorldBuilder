using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AForge.Neuro;
using AForge.Neuro.Learning;
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
                string query = "INSERT INTO [Networks] VALUES(@id, @time, @name, 0, @hidden_count, @hidden_length, NULL);";
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
        public async Task<List<Tuple<string, string>>> GetAsync(int offset, int ammount)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                List<Tuple<string, string>> res = new List<Tuple<string, string>>();
                string id, name;
                await connection.OpenAsync();
                string query = "SELECT n.network_id, n.name FROM [Networks] as n ORDER BY n.train_date DESC OFFSET @offset ROWS FETCH NEXT @ammount ROWS ONLY;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@offset", offset);
                sqlCommand.Parameters.AddWithValue("@ammount", ammount);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                while (reader.Read())
                {
                    id = (string)reader["network_id"];
                    name = (string)reader["name"];
                    res.Add(new Tuple<string, string>(id, name));
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
                byte[] netData = new byte[0];
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
                    netData = !reader.IsDBNull(3) ? Convert.FromBase64String(reader.GetString(3)) : null;
                    trainDate = reader.GetDateTime(4);
                }
                reader.Close();
                connection.Close();

                upToDate = await new MagicController().UpToDate(trainDate);

                ActivationNetwork network;

                if(trained && upToDate)
                {//if training can be "Added"
                    Stream stream = new MemoryStream(netData);
                    network = (ActivationNetwork)Network.Load(stream);
                }
                else
                {//if network needs to be recreated
                    for (int i = 0; i < hidden_count; i++)
                    {
                        n_Count.Add(hidden_length);
                    }
                    n_Count.Add(output[0].Length);//output neuron length
                    network = new ActivationNetwork(new SigmoidFunction(), input[0].Length, n_Count.ToArray());
                }


                //training proccess
                await Train(network, input, output);

                //saving proccess
                MemoryStream ms = new MemoryStream();
                network.Save(ms);
                netData = ms.GetBuffer();

                await connection.OpenAsync();
                int res;
                query = "UPDATE [Networks] SET train_date = @date, trained = 1, data = @data WHERE network_id = @id;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                sqlCommand.Parameters.AddWithValue("@date", DateTime.Now);
                sqlCommand.Parameters.AddWithValue("@data", Convert.ToBase64String(netData));
                res = await sqlCommand.ExecuteNonQueryAsync();

                query = "DELETE FROM [NetworkMagics] WHERE network_id = @id;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                await sqlCommand.ExecuteNonQueryAsync();

                query = "INSERT INTO [NetworkMagics] (network_id, magic_type) SELECT @id, m.magic_type FROM [MagicTypes] AS m ORDER BY m.create_time DESC;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                await sqlCommand.ExecuteNonQueryAsync();
                connection.Close();

                return res;
            }
            catch(Exception e)
            {
                Console.WriteLine(e.Message);
                return 0;
            }
        }

        private async Task Train(ActivationNetwork network, double[][] input, double[][] output)
        {
            BackPropagationLearning teacher = new BackPropagationLearning(network);

            teacher.LearningRate = 0.005f;
            teacher.Momentum = 0.005f;

            int maxIterations = 2000;
            int maxUp = 10;
            double lastErr = 100;

            int countUp = 0;
            int numIterations = 0;
            double error;

            do
            {
                error = teacher.RunEpoch(input, output);

                //handle stop conditions
                if (lastErr < error)
                    countUp++;
                else
                    countUp = 0;
                lastErr = error;
                numIterations++;
            } while (countUp < maxUp && numIterations < maxIterations);
        }
    }
}