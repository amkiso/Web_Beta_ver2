using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Web_Beta_ver2.Models;

namespace Web_Beta.Controllers
{
    public class ManageController : Controller
    {
        SQLDataClassesDataContext da = new SQLDataClassesDataContext();
        Xuly xl = new Xuly();
        // GET: Manage
        public ActionResult Dashboard()
        {
            return View();
        }
        public ActionResult User()
        {
            List<User> users = da.Users.ToList();
            return View(users);
        }
        public ActionResult Products()
        {
            return View();
        }
        public ActionResult Setting()
        {
            return View();
        }
        public ActionResult Stats()
        {
            return View();
        }
        public ActionResult Import_Product()
        {
            List<product_import> phieunhaphang = da.product_imports.ToList();
            return View(phieunhaphang);
        }
        public ActionResult Product_Manager()
        {
            List<Product_Infomation> pr = xl.itemproduct();
            return View(pr);
        }
    }
}