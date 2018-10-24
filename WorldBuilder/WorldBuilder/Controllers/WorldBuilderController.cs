using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorldBuilder.Models;
using WorldStorage.Controllers;

namespace WorldBuilder.Controllers
{
    public class WorldBuilderController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}