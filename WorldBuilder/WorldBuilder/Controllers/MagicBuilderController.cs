using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldStorage.Code;
using WorldStorage.Controllers;

namespace WorldBuilder.Controllers
{
    public class MagicBuilderController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Train()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> _PostMagicType(string name, string image, string data)
        {
            int res = await new MagicController().PostAsync(name, image, data);
            return Json(res);
        }

        [HttpPost]
        public async Task<ActionResult> _PostTrainData(string data, string magic_id)
        {
            int res = await new MagicController().PostAsync(data, magic_id);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetMagicTypes(int offset, int ammount)
        {
            List<Tuple<string, string, string, string, int>> res = await new MagicController().GetAsync(offset, ammount);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetMagicMin(string id)
        {
            List<Magic> res = await new MagicController().GetByNet(id);
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