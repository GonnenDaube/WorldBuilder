using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorldStorage.Controllers;

namespace WorldBuilder.Controllers
{
    public class SpriteBuilderController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Normal()
        {
            return View();
        }

        [HttpGet]
        public async Task<ActionResult> _GetSprites(int offset, int ammount)
        {
            List<Tuple<string, string, string>> res = await new SpriteController().GetAsync(offset, ammount);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetSpriteNumber()
        {
            int res = await new SpriteController().GetNumberAsync();
            return Json(res);
        }

        [HttpPost]
        public async Task<ActionResult> _PostSprite(string file, string name)
        {
            int res = await new SpriteController().PostAsync(file, name);
            return Json(res);
        }

        [HttpDelete]
        public async Task<ActionResult> _DeleteSprite(string id)
        {
            int res = await new SpriteController().DeleteAsync(id);
            return Json(res);
        }
    }
}