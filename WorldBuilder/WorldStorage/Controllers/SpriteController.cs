using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorldStorage.Code;

namespace WorldStorage.Controllers
{
    [Produces("application/json")]
    [Route("api/Sprite")]
    public class SpriteController : Controller
    {
        [HttpGet]
        public async Task<List<Tuple<string, string, string>>> GetAsync(int offset, int ammount)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                List<Tuple<string, string, string>> res = new List<Tuple<string, string, string>>();
                string id, file, name;
                byte[] data;
                await connection.OpenAsync();
                string query = "SELECT s.sprite_type_id, s.image, s.name FROM [SpriteTypes] as s ORDER BY s.create_time DESC OFFSET @offset ROWS FETCH NEXT @ammount ROWS ONLY;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@offset", offset);
                sqlCommand.Parameters.AddWithValue("@ammount", ammount);
                SqlDataReader reader = sqlCommand.ExecuteReader();
                while (reader.Read())
                {
                    id = reader.GetString(0);
                    data = (byte[])reader["image"];
                    name = (string)reader["name"];
                    file = Convert.ToBase64String(data);
                    file = "data:image/" + name.Substring(name.IndexOf('.') + 1) + ";base64," + file;
                    res.Add(new Tuple<string, string, string>(id, file, name));
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
        public async Task<Dictionary<string, string>> GetAsync(List<string> ids)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                Dictionary<string, string> res = new Dictionary<string, string>();
                string id, file, name;
                byte[] data;
                await connection.OpenAsync();
                string query = "SELECT s.sprite_type_id, s.image, s.name FROM [SpriteTypes] as s WHERE s.sprite_type_id IN (";//only selects sprites that appear in the list
                for(int i = 0; i < ids.Count; i++)
                {
                    query += "'" + ids[i] + ((i == ids.Count - 1) ? "');" : "', ");
                }

                SqlCommand sqlCommand = new SqlCommand(query, connection);
                SqlDataReader reader = sqlCommand.ExecuteReader();
                while (reader.Read())
                {
                    id = reader.GetString(0);
                    data = (byte[])reader["image"];
                    name = (string)reader["name"];
                    file = Convert.ToBase64String(data);
                    file = "data:image/" + name.Substring(name.IndexOf('.') + 1) + ";base64," + file;
                    res.Add(id, file);
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
                string query = "SELECT COUNT(s.sprite_type_id) FROM [SpriteTypes] as s;";
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

        [HttpPut]
        public async Task<int> SetSpriteNormalAsync([FromBody]string sprite, [FromBody]string normal)
        {
            try
            {
                string location = System.IO.Path.GetFullPath(@"..\..\");
                string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
                SqlConnection connection = new SqlConnection(connectionString);
                await connection.OpenAsync();
                string query = "UPDATE [SpriteTypes] SET normal_map = @normal WHERE sprite_type_id = @id";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", sprite);
                sqlCommand.Parameters.AddWithValue("@normal", normal);
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

        [HttpPost]
        public async Task<string> PostAsync([FromBody]string file, [FromBody]string name)
        {
            try
            {
                string base64Data = Regex.Match(file, @"data:image/(?<type>.+?),(?<data>.+)").Groups["data"].Value;
                string type = Regex.Match(file, @"data:image/(?<type>.+?),(?<data>.+)").Groups["type"].Value;
                byte[] data = Convert.FromBase64String(base64Data);
                string location = System.IO.Path.GetFullPath(@"..\..\");
                string id = IdGenerator.GenerateID();
                string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
                SqlConnection connection = new SqlConnection(connectionString);
                await connection.OpenAsync();
                string query = "INSERT INTO [SpriteTypes] (sprite_type_id, image, name, create_time) VALUES (@id, @image, @name, @time);";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                sqlCommand.Parameters.AddWithValue("@image", data);
                sqlCommand.Parameters.AddWithValue("@name", name);
                sqlCommand.Parameters.AddWithValue("@time", DateTime.Now);
                int res = sqlCommand.ExecuteNonQuery();
                connection.Close();
                return id;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return null;
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
                string query = "DELETE FROM [SpriteTypes] WHERE sprite_type_id = @id;";
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