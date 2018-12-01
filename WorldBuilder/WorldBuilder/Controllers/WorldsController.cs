using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldStorage.Controllers;

namespace WorldBuilder.Controllers
{
    public class WorldsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<ActionResult> _GetWorlds(int offset, int ammount)
        {
            List<Tuple<string, string>> res = await new WorldController().GetAsync(offset, ammount);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetWorldNumber()
        {
            int res = await new WorldController().GetNumberAsync();
            return Json(res);
        }

        [HttpDelete]
        public async Task<ActionResult> _DeleteWorld(string id)
        {
            int res = await new WorldController().DeleteAsync(id);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetPortals(string id, string start)
        {
            return Json(await new WorldController().GetPortalsAsync(id, start));
        }

        [HttpGet]
        public async Task<ActionResult> _GetPortal(string id)
        {
            return Json(await new WorldController().GetPortalAsync(id));
        }

        [HttpGet]
        public async Task<ActionResult> _GetWorldsByName(string start)
        {
            return Json(await new WorldController().GetWorldsAsync(start));
        }
    }
}