using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldStorage.Controllers;

namespace WorldBuilder.Controllers
{
    public class MagicBuilderController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> _PostMagicType(string name, string image, string data)
        {
            int res = await new MagicController().PostAsync(name, image, data);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetMagicTypes(int offset, int ammount)
        {
            List<Tuple<string, string, string, string>> res = await new MagicController().GetAsync(offset, ammount);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetMagicTypeNumber()
        {
            int res = await new MagicController().GetNumberAsync();
            return Json(res);
        }

        [HttpDelete]
        public async Task<ActionResult> _DeleteMagicType(string id)
        {
            int res = await new MagicController().DeleteAsync(id);
            return Json(res);
        }
    }
}