using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldStorage.Controllers;

namespace WorldBuilder.Controllers
{
    public class NetworkTrainerController : Controller
    {

        public IActionResult Train(string id)
        {
            ViewBag.NetworkId = id;
            return View();
        }

        [HttpPut]
        public async Task<ActionResult> _TrainNetwork(string id)
        {
            int res = await new NetworkController().TrainNetwork(id);
            return Json(res);
        }
    }
}