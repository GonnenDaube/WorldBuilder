using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldBuilder.Code;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Text;
using Newtonsoft.Json;
using WorldStorage.Controllers;
using WorldStorage.Code;

namespace WorldBuilder.Controllers
{
    public class WorldBuilderController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }


        public IActionResult Edit(string id)
        {
            ViewBag.WorldId = id;
            return View();
        }

        [HttpPost]
        [RequestSizeLimit(100 * 1024)]
        public async Task<ActionResult> _PostWorld([FromBody]string value)
        {
            World world = JsonConvert.DeserializeObject<World>(value);
            string res = await new WorldController().PostAsync(world);
            return Json(res);
        }

        [HttpPut]
        [RequestSizeLimit(100 * 1024)]
        public async Task<ActionResult> _UpdateWorld(string id, string world)
        {
            World world_obj = JsonConvert.DeserializeObject<World>(world);
            string res = await new WorldController().PutAsync(id, world_obj);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetWorld(string id)
        {
            World res = await new WorldController().GetAsync(id);
            return Json(res);
        }
        
    }
}