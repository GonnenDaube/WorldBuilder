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
    [Route("api/[controller]")]
    public class ColorController : Controller
    {
        [HttpGet]
        public async Task<List<Tuple<string, float, float, float, float>>> GetAsync(int offset, int ammount)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                List<Tuple<string, float, float, float, float>> res = new List<Tuple<string, float, float, float, float>>();
                string id;
                float r, g, b, a;
                await connection.OpenAsync();
                string query = "SELECT c.color_id, c.r, c.g, c.b, c.a FROM [Colors] as c ORDER BY c.create_time DESC OFFSET @offset ROWS FETCH NEXT @ammount ROWS ONLY;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@offset", offset);
                sqlCommand.Parameters.AddWithValue("@ammount", ammount);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                while (reader.Read())
                {
                    id = reader.GetString(0);
                    r = (float)reader.GetDouble(1);
                    g = (float)reader.GetDouble(2);
                    b = (float)reader.GetDouble(3);
                    a = (float)reader.GetDouble(4);
                    res.Add(new Tuple<string, float, float, float, float>(id, r, g, b, a));
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

        [HttpPost]
        public async Task<int> PostAsync([FromBody]float r,[FromBody] float g,[FromBody] float b,[FromBody] float a)
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
                int res = await sqlCommand.ExecuteNonQueryAsync();
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
                int res = await sqlCommand.ExecuteNonQueryAsync();
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