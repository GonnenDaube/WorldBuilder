using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WorldBuilder.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public ActionResult _Login(string username, string password)
        {

            ResourceManager rm = new ResourceManager("WorldBuilder.Data.Resources", Assembly.GetExecutingAssembly());
            try
            {
                string pass = rm.GetString(username);
                if (pass.Equals(password))
                {
                    byte[] val = new byte[1];
                    val[0] = 1;
                    HttpContext.Session.Set("isLogged", val);
                    return Json(1);
                }
                else
                {
                    throw new Exception();
                }
            }
            catch(Exception e)
            {
                return Json(0);
            }
        }
    }
}