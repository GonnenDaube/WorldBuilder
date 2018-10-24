using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using WorldStorage.Code;

namespace WorldStorage.Controllers
{
    [Produces("application/json")]
    [Route("WorldApi/Color")]
    public class ColorController : Controller
    {
        [HttpPost]
        public async Task<List<Tuple<byte, byte, byte, float>>> GetAsync()
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                List<Tuple<byte, byte, byte, float>> res = new List<Tuple<byte, byte, byte, float>>();
                byte r, g, b;
                float a;
                await connection.OpenAsync();
                string query = "SELECT TOP 10 c.r, c.g, c.b, c.a FROM [Colors] as c ORDER BY c.create_time;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                SqlDataReader reader = sqlCommand.ExecuteReader();
                while (reader.Read())
                {
                    r = reader.GetByte(0);
                    g = reader.GetByte(1);
                    b = reader.GetByte(2);
                    a = (float)reader.GetDouble(3);
                    res.Add(new Tuple<byte, byte, byte, float>(r,g,b,a));
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

        [HttpPost]
        public async Task<int> PostAsync([FromBody]int r,[FromBody] int g,[FromBody] int b,[FromBody] float a)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                await connection.OpenAsync();
                string query = "INSERT INTO [Colors] (color_id, r, g, b, a, create_time) VALUES (@id, @r, @g, @b, @a, @time);";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", IdGenerator.GenerateID());
                sqlCommand.Parameters.AddWithValue("@r", r);
                sqlCommand.Parameters.AddWithValue("@g", g);
                sqlCommand.Parameters.AddWithValue("@b", b);
                sqlCommand.Parameters.AddWithValue("@a", a);
                sqlCommand.Parameters.AddWithValue("@time", DateTime.Now);
                int res = sqlCommand.ExecuteNonQuery();
                connection.Close();
                return res;
            }
            catch(Exception e)
            {
                Console.WriteLine(e.Message);
                return 0;
            }
        }
    }
}