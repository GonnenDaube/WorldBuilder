using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldBuilder.Models;
using WorldStorage.Controllers;

namespace WorldBuilder.Controllers
{
    public class WorldBuilderController : Controller
    {
        public IActionResult Index()
        {
            //WorldBuilderViewModel model = new WorldBuilderViewModel()
            //{
            //    numPoints = 10,
            //    worldSize = 10
            //};
            //byte[] val;
            //HttpContext.Session.TryGetValue("world-points", out val);
            //model.numPoints = Convert.ToInt32(val);
            //HttpContext.Session.TryGetValue("world-size", out val);
            //model.worldSize = Convert.ToInt32(val);
            return View();
        }

        public async Task<ActionResult> _GetValues(int attr1 = 0, int attr2 = 0)
        {
            JsonResult jsRes = null;
            List<string> res = await new ValuesController().Get(attr1, attr2);
            jsRes = Json(res);
            return jsRes;
        }
    }
}