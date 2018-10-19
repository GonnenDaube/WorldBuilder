using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldBuilder.Models;

namespace WorldBuilder.Controllers
{
    public class WorldBuilderController : Controller
    {
        public IActionResult Index()
        {
            WorldBuilderViewModel model = new WorldBuilderViewModel()
            {
                numPoints = 10,
                worldSize = 10
            };
            //byte[] val;
            //HttpContext.Session.TryGetValue("world-points", out val);
            //model.numPoints = Convert.ToInt32(val);
            //HttpContext.Session.TryGetValue("world-size", out val);
            //model.worldSize = Convert.ToInt32(val);
            return View(model);
        }
    }
}