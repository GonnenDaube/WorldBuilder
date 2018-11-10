using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorldBuilder.Code;

namespace WorldStorage.Controllers
{
    [Produces("application/json")]
    [Route("api/Worlds")]
    public class WorldController : Controller
    {

        [HttpPost]
        public async Task<string> PostAsync(Layer[] layers)
        {
            try
            {
                //string id = IdGenerator.GenerateID();
                //string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
                //SqlConnection connection = new SqlConnection(connectionString);
                //await connection.OpenAsync();
                //string query = "INSERT INTO [SpriteTypes] (sprite_type_id, image, name, create_time) VALUES (@id, @image, @name, @time);";
                //SqlCommand sqlCommand = new SqlCommand(query, connection);
                //sqlCommand.Parameters.AddWithValue("@id", id);
                //sqlCommand.Parameters.AddWithValue("@image", data);
                //sqlCommand.Parameters.AddWithValue("@name", name);
                //sqlCommand.Parameters.AddWithValue("@time", DateTime.Now);
                //int res = sqlCommand.ExecuteNonQuery();
                //connection.Close();
                //return id;
                return null;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return null;
            }
        }
    }
}