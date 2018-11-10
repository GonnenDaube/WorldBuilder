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

namespace WorldBuilder.Controllers
{
    public class WorldBuilderController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [RequestSizeLimit(100 * 1024)]
        public async Task<ActionResult> _PostWorld([FromBody]string value)
        {
            Layer[] layers = JsonConvert.DeserializeObject<Layer[]>(value);
            string res = await new WorldController().PostAsync(layers);
            return Json(res);
        }
    }
}