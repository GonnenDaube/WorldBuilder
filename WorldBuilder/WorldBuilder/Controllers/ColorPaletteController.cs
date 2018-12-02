using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
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
        public async Task<ActionResult> _PostColor(float r, float g, float b, float a)
        {
            string val = HttpContext.Session.GetString("isLogged");
            if (string.IsNullOrEmpty(val))
                return null;
            int res = await new ColorController().PostAsync(r, g, b, a);
            return Json(res);
        }
        
        [HttpGet]
        public async Task<ActionResult> _GetColors(int offset, int ammount)
        {
            List<Tuple<string, float, float, float, float>> res = await new ColorController().GetAsync(offset, ammount);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetColorNumber()
        {
            int res = await new ColorController().GetNumberAsync();
            return Json(res);
        }

        [HttpDelete]
        public async Task<ActionResult> _DeleteColor(string id)
        {
            string val = HttpContext.Session.GetString("isLogged");
            if (string.IsNullOrEmpty(val))
                return null;
            int res = await new ColorController().DeleteAsync(id);
            return Json(res);
        }
    }
}