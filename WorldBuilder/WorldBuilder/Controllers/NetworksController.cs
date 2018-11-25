using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldStorage.Code;
using WorldStorage.Controllers;

namespace WorldBuilder.Controllers
{
    public class NetworksController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> _PostNetwork(string name, int hidden_count, int hidden_length)
        {
            int res = await new NetworkController().PostAsync(name, hidden_count, hidden_length);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetNetworks(int offset, int ammount)
        {
            List<Tuple<string, string, double>> res = await new NetworkController().GetAsync(offset, ammount);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetNetwork(string id)
        {
            Network res = await new NetworkController().GetNetworkAsync(id);
            return Json(res);
        }

        [HttpGet]
        public async Task<ActionResult> _GetNetworkNumber()
        {
            int res = await new NetworkController().GetNumberAsync();
            return Json(res);
        }

        [HttpDelete]
        public async Task<ActionResult> _DeleteNetwork(string id)
        {
            int res = await new NetworkController().DeleteAsync(id);
            return Json(res);
        }
    }
}