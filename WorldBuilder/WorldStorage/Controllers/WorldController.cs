using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorldBuilder.Code;
using WorldStorage.Code;

namespace WorldStorage.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class WorldController : Controller
    {

        [HttpPost]
        public async Task<string> PostAsync(World world, string id = "")
        {
            try
            {
                bool createWorld = id == "";
                string location = System.IO.Path.GetFullPath(@"..\..\");
                if (createWorld)
                    id = IdGenerator.GenerateID();
                string layer_id;
                string point_id;
                string sprite_id;
                string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
                SqlConnection connection = new SqlConnection(connectionString);
                await connection.OpenAsync();
                string query;
                SqlCommand sqlCommand;
                if (createWorld)
                {
                    //Insert world record
                    query = "INSERT INTO [Worlds] (world_id, planet_id, name, create_time) VALUES (@id, @planet, @name, @time);";
                    sqlCommand = new SqlCommand(query, connection);
                    sqlCommand.Parameters.AddWithValue("@id", id);
                    sqlCommand.Parameters.AddWithValue("@planet", world.planet_id);
                    sqlCommand.Parameters.AddWithValue("@name", world.name);
                    sqlCommand.Parameters.AddWithValue("@time", DateTime.Now);
                    await sqlCommand.ExecuteNonQueryAsync();
                }
                else
                {
                    //Update world record
                    query = "UPDATE [Worlds] SET name = @name WHERE world_id = @id";
                    sqlCommand = new SqlCommand(query, connection);
                    sqlCommand.Parameters.AddWithValue("@id", id);
                    sqlCommand.Parameters.AddWithValue("@name", world.name);
                    await sqlCommand.ExecuteNonQueryAsync();
                }
                for(int i = 0; i <world.layers.Count; i++)
                {
                    layer_id = IdGenerator.GenerateID();
                    //Insert layer record
                    query = "INSERT INTO [Layers] (layer_id, layer_index, world_id, color, size) VALUES (@id, @index, @world_id, @color, @size);";
                    sqlCommand = new SqlCommand(query, connection);
                    sqlCommand.Parameters.AddWithValue("@id", layer_id);
                    sqlCommand.Parameters.AddWithValue("@index", i);
                    sqlCommand.Parameters.AddWithValue("@world_id", id);
                    sqlCommand.Parameters.AddWithValue("@color", world.layers[i].color_id);
                    sqlCommand.Parameters.AddWithValue("@size", world.layers[i].size);
                    await sqlCommand.ExecuteNonQueryAsync();

                    //Insert points for layer
                    if (world.layers[i].x.Count > 0)
                    {
                        query = "INSERT INTO [Points] (point_id, layer_id, x, y) VALUES";
                        for (int j = 0; j < world.layers[i].x.Count; j++)
                        {
                            point_id = IdGenerator.GenerateID();
                            query += (j == 0 ? "" : ",") + " (";
                            query += "'" + point_id + "'";
                            query += ", '" + layer_id + "'";
                            query += ", " + world.layers[i].x[j];
                            query += ", " + world.layers[i].y[j] + ")";
                        }
                        query += ";";
                        sqlCommand = new SqlCommand(query, connection);
                        await sqlCommand.ExecuteNonQueryAsync();
                    }

                    //Insert sprites for layer
                    if(world.layers[i].sprites.Count > 0)
                    {
                        query = "INSERT INTO [Sprites] (sprite_id, sprite_type, layer_id, size, x, y, rotation, zIndex) VALUES";
                        for (int j = 0; j < world.layers[i].sprites.Count; j++)
                        {
                            sprite_id = IdGenerator.GenerateID();
                            query += (j == 0 ? "" : ",") + " (";
                            query += "'" + sprite_id + "'";
                            query += ", '" + world.layers[i].sprites[j].id + "'";//type
                            query += ", '" + layer_id + "'";
                            query += ", " + world.layers[i].sprites[j].size;
                            query += ", " + world.layers[i].sprites[j].x;
                            query += ", " + world.layers[i].sprites[j].y;
                            query += ", " + world.layers[i].sprites[j].rotation;
                            query += ", " + world.layers[i].sprites[j].zIndex + ")";
                        }
                        query += ";";
                        sqlCommand = new SqlCommand(query, connection);
                        await sqlCommand.ExecuteNonQueryAsync();
                    }
                }

                foreach(Portal portal in world.layers[4].portals)
                {
                    string portal_id = IdGenerator.GenerateID();
                    query = "INSERT INTO [Portals] (portal_id, world_id, x, y, name) VALUES(@portal_id, @world_id, @portal_x, @portal_y, @portal_name);";
                    sqlCommand = new SqlCommand(query, connection);
                    sqlCommand.Parameters.AddWithValue("@portal_id", portal_id);
                    sqlCommand.Parameters.AddWithValue("@world_id", id);
                    sqlCommand.Parameters.AddWithValue("@portal_y", portal.y);
                    sqlCommand.Parameters.AddWithValue("@portal_x", portal.x);
                    sqlCommand.Parameters.AddWithValue("@portal_name", portal.name);
                    await sqlCommand.ExecuteNonQueryAsync();

                    if(portal.link != null)
                    {
                        query = "INSERT INTO [Links] (portal1_id, portal2_id) VALUES(@portal1_id, @portal2_id);";
                        sqlCommand = new SqlCommand(query, connection);
                        sqlCommand.Parameters.AddWithValue("@portal1_id", portal_id);
                        sqlCommand.Parameters.AddWithValue("@portal2_id", portal.link.portal_target);
                        await sqlCommand.ExecuteNonQueryAsync();
                    }
                }

                connection.Close();
                return id;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return null;
            }
        }

        [HttpGet, Authorize]
        public async Task<List<Tuple<string, string>>> GetWorldsAsync(string start)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                List<Tuple<string, string>> res = new List<Tuple<string, string>>();
                string id, name;
                await connection.OpenAsync();
                string query = "SELECT w.world_id, w.name FROM [Worlds] as w WHERE w.name LIKE '%" + start + "%';";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                while (reader.Read())
                {
                    id = (string)reader["world_id"];
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
        public async Task<List<Tuple<string, string>>> GetPortalsAsync(string world_id, string start)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                List<Tuple<string, string>> res = new List<Tuple<string, string>>();
                string id, name;
                await connection.OpenAsync();
                string query = "SELECT p.portal_id, p.name FROM [Portals] as p WHERE p.world_id = @id AND p.name LIKE '%" + start + "%';";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", world_id);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                while (reader.Read())
                {
                    id = (string)reader["portal_id"];
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
        public async Task<float> GetPortalAsync(string id)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                float x = 0;
                await connection.OpenAsync();
                string query = "SELECT p.x FROM [Portals] as p WHERE p.portal_id = @id;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                while (reader.Read())
                {
                    x = Convert.ToSingle((double)reader["x"]);
                }
                reader.Close();
                connection.Close();
                return x;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return 0;
            }
        }

        [HttpPut]
        public async Task<string> PutAsync(string id, World world)
        {
            await DeleteAsync(id, false);
            return await PostAsync(world, id);
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
                string query = "SELECT w.world_id, w.name FROM [Worlds] as w ORDER BY w.create_time DESC OFFSET @offset ROWS FETCH NEXT @ammount ROWS ONLY;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@offset", offset);
                sqlCommand.Parameters.AddWithValue("@ammount", ammount);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                while (reader.Read())
                {
                    id = (string)reader["world_id"];
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
        public async Task<World> GetAsync(string id)
        {
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30;MultipleActiveResultSets=True";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                float temp;
                World res = new World();
                await connection.OpenAsync();
                string query = "SELECT w.name, w.planet_id FROM [Worlds] as w WHERE w.world_id LIKE @id;";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                SqlDataReader reader = await sqlCommand.ExecuteReaderAsync();
                if(reader.Read())
                {
                    res.name = (string)reader["name"];
                    res.planet_id = (string)reader["planet_id"];
                }
                reader.Close();

                query = "SELECT l.layer_id, l.color, l.size, c.r, c.g, c.b, c.a FROM [Layers] as l INNER JOIN [Colors] as c ON l.color = c.color_id WHERE l.world_id LIKE @id ORDER BY l.layer_index ASC;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                reader = await sqlCommand.ExecuteReaderAsync();
                res.layers = new List<Layer>();
                Layer l;
                Sprite s;
                List<string> layer_ids = new List<string>();
                while (reader.Read())
                {
                    l = new Layer();
                    layer_ids.Add((string)reader["layer_id"]);
                    l.color_id = (string)reader["color"];
                    l.color = new List<float>();
                    l.color.Add(Convert.ToSingle((double)reader["r"]));
                    l.color.Add(Convert.ToSingle((double)reader["g"]));
                    l.color.Add(Convert.ToSingle((double)reader["b"]));
                    l.color.Add(Convert.ToSingle((double)reader["a"]));
                    l.size = Convert.ToSingle((double)reader["size"]);
                    res.layers.Add(l);
                }
                reader.Close();

                for(int i = 0; i < res.layers.Count; i++)
                {
                    query = "SELECT p.x, p.y FROM [Points] as p WHERE p.layer_id LIKE @id ORDER BY p.x, p.y DESC;";
                    sqlCommand = new SqlCommand(query, connection);
                    sqlCommand.Parameters.AddWithValue("@id", layer_ids[i]);
                    res.layers[i].x = new List<float>();
                    res.layers[i].y = new List<float>();
                    reader = await sqlCommand.ExecuteReaderAsync();
                    while (reader.Read())
                    {
                        res.layers[i].x.Add(Convert.ToSingle((double)reader["x"]));
                        res.layers[i].y.Add(Convert.ToSingle((double)reader["y"]));
                    }
                    //switch last places
                    temp = res.layers[i].y[res.layers[i].y.Count() - 1];
                    res.layers[i].y[res.layers[i].y.Count() - 1] = res.layers[i].y[res.layers[i].y.Count() - 2];
                    res.layers[i].y[res.layers[i].y.Count() - 2] = temp;
                    reader.Close();

                    query = "SELECT s.sprite_type, s.size, s.x, s.y, s.rotation, s.zIndex FROM [Sprites] as s WHERE s.layer_id LIKE @id;";
                    sqlCommand = new SqlCommand(query, connection);
                    sqlCommand.Parameters.AddWithValue("@id", layer_ids[i]);
                    res.layers[i].sprites = new List<Sprite>();
                    reader = await sqlCommand.ExecuteReaderAsync();
                    while (reader.Read())
                    {
                        s = new Sprite();
                        s.id = (string)reader["sprite_type"];
                        s.zIndex = (int)reader["zIndex"];
                        s.rotation = Convert.ToSingle((double)reader["rotation"]);
                        s.size = Convert.ToSingle((double)reader["size"]);
                        s.x = Convert.ToSingle((double)reader["x"]);
                        s.y = Convert.ToSingle((double)reader["y"]);
                        res.layers[i].sprites.Add(s);
                    }
                    reader.Close();
                }

                query = "SELECT p.portal_id, p.name, p.x, p.y, l.portal1_id, l.portal2_id FROM [Portals] as p LEFT JOIN [LINKS] as l ON l.portal1_id = p.portal_id OR l.portal2_id = p.portal_id WHERE p.world_id = @id;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                res.layers[4].portals = new List<Portal>();
                reader = await sqlCommand.ExecuteReaderAsync();
                Portal p;
                Link link;
                while (reader.Read())
                {
                    p = new Portal();
                    if (!reader.IsDBNull(4))
                    {
                        link = new Link();
                        if ((string)reader["portal_id"] == (string)reader["portal1_id"])
                        {
                            link.portal_target = (string)reader["portal2_id"];
                        }
                        else
                        {
                            link.portal_target = (string)reader["portal1_id"];
                        }
                        query = "SELECT w.world_id FROM [Worlds] as w INNER JOIN [Portals] as p ON w.world_id = p.world_id WHERE p.portal_id = @id;";
                        sqlCommand = new SqlCommand(query, connection);
                        sqlCommand.Parameters.AddWithValue("@id", link.portal_target);
                        SqlDataReader reader2 = await sqlCommand.ExecuteReaderAsync();
                        if (reader2.Read())
                        {
                            link.world_target = (string)reader2["world_id"];
                        }
                        reader2.Close();
                        p.link = link;
                    }
                    p.name = (string)reader["name"];
                    p.x = Convert.ToSingle((double)reader["x"]);
                    p.y = Convert.ToSingle((double)reader["y"]);
                    res.layers[4].portals.Add(p);
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
                string query = "SELECT COUNT(w.world_id) FROM [Worlds] as w;";
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
        public async Task<int> DeleteAsync(string id, bool delete_world = true)
        {   //TODO: extend for all related tables
            string location = System.IO.Path.GetFullPath(@"..\..\");
            string connectionString = @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=" + location + @"WorldBuilder\WorldStorage\Database\WorldDB.mdf;Integrated Security=True;Connect Timeout=30";
            SqlConnection connection = new SqlConnection(connectionString);
            try
            {
                await connection.OpenAsync();
                string query = "DELETE FROM [Points] WHERE layer_id IN (SELECT l.layer_id FROM [Layers] AS l WHERE l.world_id = @id);";
                SqlCommand sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                int res = await sqlCommand.ExecuteNonQueryAsync();
                query = "DELETE FROM [Sprites] WHERE layer_id IN (SELECT l.layer_id FROM [Layers] AS l WHERE l.world_id = @id);";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                res = await sqlCommand.ExecuteNonQueryAsync();

                query = "DELETE FROM [Layers] WHERE world_id = @id;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                res = await sqlCommand.ExecuteNonQueryAsync();
                query = "DELETE FROM [LINKS] WHERE portal1_id IN (SELECT p.portal_id FROM [Portals] as p WHERE p.world_id = @id) OR portal2_id IN (SELECT p.portal_id FROM [Portals] as p WHERE p.world_id = @id)";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                res = await sqlCommand.ExecuteNonQueryAsync();
                query = "DELETE FROM [Portals] WHERE world_id = @id;";
                sqlCommand = new SqlCommand(query, connection);
                sqlCommand.Parameters.AddWithValue("@id", id);
                res = await sqlCommand.ExecuteNonQueryAsync();
                if (delete_world)
                {
                    query = "DELETE FROM [Worlds] WHERE world_id = @id;";
                    sqlCommand = new SqlCommand(query, connection);
                    sqlCommand.Parameters.AddWithValue("@id", id);
                    res = await sqlCommand.ExecuteNonQueryAsync();
                }
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