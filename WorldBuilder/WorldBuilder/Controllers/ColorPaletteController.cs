using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldStorage.Controllers;

namespace WorldBuilder.Controllers
{
    public class ColorPaletteController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> _PostColor(int r, int g, int b, float a)
        {
            int res = await new ColorController().PostAsync(r, g, b, a);
            return Json(res);
        }
        
        [HttpGet]
        public async Task<ActionResult> _GetColors()
        {
            List<Tuple<byte, byte, byte, float>> res = await new ColorController().GetAsync();
            return Json(res);
        }
    }
}