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
        [HttpGet]
        public async Task<List<Tuple<string, byte, byte, byte, float>>> GetAsync(int offset, int ammount)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                List<Tuple<string, byte, byte, byte, float>> res = new List<Tuple<string, byte, byte, byte, float>>();
                string id;
                byte r, g, b;
                float a;
                await connection.OpenAsync();
                string query = "SELECT c.color_id, c.r, c.g, c.b, c.a FROM [Colors] as c ORDER BY c.create_time DESC OFFSET @offset ROWS FETCH NEXT @ammount ROWS ONLY;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@offset", offset);
                sqlCommand.Parameters.AddWithValue("@ammount", ammount);
                SqlDataReader reader = sqlCommand.ExecuteReader();
                while (reader.Read())
                {
                    id = reader.GetString(0);
                    r = reader.GetByte(1);
                    g = reader.GetByte(2);
                    b = reader.GetByte(3);
                    a = (float)reader.GetDouble(4);
                    res.Add(new Tuple<string, byte, byte, byte, float>(id, r, g, b, a));
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

        [HttpGet]
        public async Task<int> GetNumberAsync()
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                int res = 0;
                await connection.OpenAsync();
                string query = "SELECT COUNT(c.color_id) FROM [Colors] as c;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                SqlDataReader reader = sqlCommand.ExecuteReader();
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

        [HttpDelete]
        public async Task<int> DeleteAsync([FromBody] string id)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                await connection.OpenAsync();
                string query = "DELETE FROM [Colors] WHERE color_id = @id;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                int res = sqlCommand.ExecuteNonQuery();
                connection.Close();
                return res;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return 0;
            }
        }
    }
}