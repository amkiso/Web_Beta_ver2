using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Web_Beta_ver2.Models;

namespace Web_beta_ver2.Controllers
{
    public class ProductsController : Controller
    {
        Xuly xl = new Xuly();
        private const int PageSize = 15; // 15 sản phẩm mỗi lần load

        // GET: Products
        

        // GET: SmartPhone - Hiển thị sản phẩm điện thoại
        public ActionResult SmartPhone(string sortBy = "featured", int page = 1)
        {
            // Lấy sản phẩm theo loại 2 (Smart Phone) - Type_Product_ID là INT
            List<Product_Infomation> allProducts = xl.GetProductsWithFilter(2, sortBy, page, PageSize);

            // Đếm tổng số sản phẩm
            int totalProducts = xl.GetTotalProductCount(2);

            // Tạo ViewModel
            var viewModel = new ProductFilterViewModel
            {
                Products = allProducts,
                CurrentSort = sortBy,
                CurrentPage = page,
                PageSize = PageSize,
                TotalProducts = totalProducts,
                TotalPages = (int)Math.Ceiling(totalProducts / (double)PageSize),
                HasMore = totalProducts > page * PageSize,
                CategoryName = "Điện thoại"
            };

            return View(viewModel);
        }

        // GET: Laptop - Hiển thị sản phẩm laptop
        public ActionResult Laptop(string sortBy = "featured", int page = 1)
        {
            // Lấy sản phẩm theo loại 1 (Laptop) - Type_Product_ID là INT
            List<Product_Infomation> allProducts = xl.GetProductsWithFilter(1, sortBy, page, PageSize);

            // Đếm tổng số sản phẩm
            int totalProducts = xl.GetTotalProductCount(1);

            // Tạo ViewModel
            var viewModel = new ProductFilterViewModel
            {
                Products = allProducts,
                CurrentSort = sortBy,
                CurrentPage = page,
                PageSize = PageSize,
                TotalProducts = totalProducts,
                TotalPages = (int)Math.Ceiling(totalProducts / (double)PageSize),
                HasMore = totalProducts > page * PageSize,
                CategoryName = "Laptop"
            };

            // Sử dụng cùng view với SmartPhone
            return View(viewModel);
        }

        // AJAX: Load thêm sản phẩm khi người dùng click "Xem thêm"
        [HttpGet]
        public JsonResult LoadMoreProducts(int typeProductId , string sortBy = "featured", int page = 1)
        {
            try
            {
                List<Product_Infomation> products = xl.GetProductsWithFilter(typeProductId, sortBy, page, PageSize);
                int totalProducts = xl.GetTotalProductCount(typeProductId);

                var result = new
                {
                    success = true,
                    products = products.Select(p => new
                    {
                        product_id = p.product_id,
                        product_name = p.product_name,
                        sale_price = p.sale_price,
                        original_price = p.original_price,
                        images = p.images,
                        product_description = p.product_description,
                        discount_percent = p.DiscountPercent,
                        is_new = p.is_new,
                        is_featured = p.is_featured,
                        is_in_stock = p.IsInStock
                    }),
                    hasMore = totalProducts > page * PageSize,
                    currentPage = page,
                    totalProducts = totalProducts
                };

                return Json(result, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Có lỗi xảy ra khi tải sản phẩm: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        // AJAX: Thêm sản phẩm vào giỏ hàng
        [HttpPost]
        public JsonResult AddToCart(int productId, int quantity = 1)
        {
            try
            {
                // Kiểm tra đăng nhập
                if (Session["UserID"] == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
                        requireLogin = true
                    });
                }

                int userId = Convert.ToInt32(Session["UserID"]);

                // Gọi method trong Xuly để thêm vào giỏ hàng
                bool success = xl.AddToCart(userId, productId, quantity);

                if (success)
                {
                    return Json(new
                    {
                        success = true,
                        message = "Đã thêm sản phẩm vào giỏ hàng"
                    });
                }
                else
                {
                    return Json(new
                    {
                        success = false,
                        message = "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!"
                    });
                }
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Có lỗi xảy ra: " + ex.Message
                });
            }
        }

        // GET: Product Detail
        public ActionResult ProductDetail(int id)
        {
            var products = xl.GetProductsWithFilter(id, "featured", 1, 1000);
            var product = products.FirstOrDefault(p => p.product_id == id);

            if (product == null)
            {
                return HttpNotFound();
            }

            return View(product);
        }
    }
}