using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
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
        [RequestSizeLimit(1000 * 1024)]//1 MB request limit
        
        public async Task<ActionResult> _GetSpriteSources(string value)
        {
            
            if (value == null || value == "")
                value = Uri.UnescapeDataString(Request.QueryString.Value.Substring(1));
            List<string> ids = JsonConvert.DeserializeObject<List<string>>(value);
            Dictionary<string, string> res = await new SpriteController().GetAsync(ids);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetSpriteNumber()
        {
            int res = await new SpriteController().GetNumberAsync();
            return Json(res);
        }

        [HttpPut]
        public async Task<ActionResult> _SetSpriteNormal(string sprite, string normal)
        {
            string val = HttpContext.Session.GetString("isLogged");
            if (string.IsNullOrEmpty(val))
                return null;
            int res = await new SpriteController().SetSpriteNormalAsync(sprite, normal);
            return Json(res);
        }

        [HttpPost]
        public async Task<ActionResult> _PostSprite(string file, string name)
        {
            string val = HttpContext.Session.GetString("isLogged");
            if (string.IsNullOrEmpty(val))
                return null;
            string res = await new SpriteController().PostAsync(file, name);
            return Json(res);
        }

        [HttpDelete]
        public async Task<ActionResult> _DeleteSprite(string id)
        {
            string val = HttpContext.Session.GetString("isLogged");
            if (string.IsNullOrEmpty(val))
                return null;
            int res = await new SpriteController().DeleteAsync(id);
            return Json(res);
        }
    }
}