using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Web_Beta.Models;

namespace Web_Beta.Controllers
{
    public class HomeController : Controller
    {
        SQLDataClassesDataContext da = new SQLDataClassesDataContext();
        Xuly xl = new Xuly();
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Products()
        {
           
            List<Product_Infomation> pr = xl.itemproduct();
            return View(pr.Take(12));
        }
        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }
        public ActionResult Login()
        {
            return View();
        }
        public ActionResult Register()
        {
            return View();
        }
        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}