using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Web_beta_ver2.Models;

namespace Web_Beta_ver2.Models
{
    public class Xuly
    {
        SQLDataClassesDataContext da = new SQLDataClassesDataContext();

        public Xuly() { }

        // =====================================================
        // PRODUCT METHODS
        // =====================================================

        // Method lấy tất cả sản phẩm (compatibility với code cũ)
        public List<Product_Infomation> itemproduct()
        {
            // Sử dụng method mới với tham số mặc định
            return GetProductsWithFilter(0, "featured", 1, 1000);
        }

        // Method để lấy sản phẩm với filter và sort
        public List<Product_Infomation> GetProductsWithFilter(
            int typeProductID,
            string sortBy = "featured",
            int pageNumber = 1,
            int pageSize = 15)
        {
            try
            {
                var result = da.sp_GetProductsWithFilter(
                    typeProductID,
                    sortBy,
                    pageNumber,
                    pageSize
                ).ToList();

                List<Product_Infomation> products = new List<Product_Infomation>();

                foreach (var item in result)
                {
                    var product = new Product_Infomation
                    {
                        product_id = item.Product_ID,
                        product_name = item.Product_name,
                        sale_price = item.Sale_Price ?? 0,
                        original_price = item.Original_Price ?? 0,
                        current_Quantity = item.Current_Quantity ,
                        product_status = item.Product_Status,
                        images = item.Product_Image,
                        type_product = item.Type_Product_name,
                        supplier_name = item.supplier_name,
                        is_featured = item.Is_Featured ?? false,
                        is_new = item.Is_New ?? false,
                        total_sold = item.Total_Sold ,
                        created_date = item.Created_Date ?? DateTime.Now,
                        product_description = ParseProductDescription(item.Descriptions)
                    };

                    products.Add(product);
                }

                return products;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in GetProductsWithFilter: {ex.Message}");
                return new List<Product_Infomation>();
            }
        }

        // Method đếm tổng số sản phẩm (cho pagination)
        public int GetTotalProductCount(int typeProductID )
        {
            try
            {
                var query = da.Products.Where(p => p.Product_Status == "selling");

                if (typeProductID>0)
                {
                    query = query.Where(p => p.Type_Product_ID == typeProductID);
                }

                return query.Count();
            }
            catch
            {
                return 0;
            }
        }

        // Method lấy sản phẩm theo loại
        public List<Product_Infomation> GetProductsByType(int typeProductID, string sortBy = "featured")
        {
            return GetProductsWithFilter(typeProductID, sortBy, 1, 1000);
        }

        // Method parse description từ chuỗi hoặc JSON
        private List<string> ParseProductDescription(string description)
        {
            try
            {
                if (string.IsNullOrEmpty(description))
                    return new List<string> { "Đang cập nhật thông tin..." };

                // Nếu có dấu ; thì split theo ;
                if (description.Contains(";"))
                {
                    return description.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries)
                                     .Select(s => s.Trim())
                                     .ToList();
                }

                // Nếu có .json thì đọc file JSON
                if (description.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
                {
                    string fullPath = HttpContext.Current.Server.MapPath($"~/Content/Json/{description}");

                    if (System.IO.File.Exists(fullPath))
                    {
                        string jsonContent = System.IO.File.ReadAllText(fullPath);
                        var descriptionObj = JsonConvert.DeserializeObject<Dictionary<string, List<string>>>(jsonContent);

                        if (descriptionObj != null && descriptionObj.ContainsKey("description"))
                        {
                            return descriptionObj["description"];
                        }
                    }
                }

                // Nếu không phải cả 2 trường hợp trên, trả về list có 1 phần tử
                return new List<string> { description };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error parsing description: {ex.Message}");
                return new List<string> { "Lỗi tải thông tin sản phẩm" };
            }
        }

        // Method update Is_Featured cho sản phẩm (dành cho Admin)
        public bool UpdateProductFeaturedStatus(int productId, bool isFeatured)
        {
            try
            {
                var product = da.Products.FirstOrDefault(p => p.Product_ID == productId);
                if (product != null)
                {
                    product.Is_Featured = isFeatured;
                    da.SubmitChanges();
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }

        // Method update Is_New cho sản phẩm (dành cho Admin)
        public bool UpdateProductNewStatus(int productId, bool isNew)
        {
            try
            {
                var product = da.Products.FirstOrDefault(p => p.Product_ID == productId);
                if (product != null)
                {
                    product.Is_New = isNew;
                    da.SubmitChanges();
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }

        // =====================================================
        // CART METHODS
        // =====================================================

        // Method thêm sản phẩm vào giỏ hàng
        public bool AddToCart(int userId, int productId, int quantity = 1)
        {
            try
            {
                // Kiểm tra sản phẩm tồn tại và còn hàng
                var product = da.Products.FirstOrDefault(p => p.Product_ID == productId);
                if (product == null || product.Current_Quantity < quantity)
                {
                    return false;
                }

                // Lấy hoặc tạo giỏ hàng cho user
                var cart = da.shopping_carts.FirstOrDefault(c => c.ID_user == userId);
                if (cart == null)
                {
                    cart = new shopping_cart
                    {
                        ID_user = userId,
                        day_create = DateTime.Now,
                        update_at = DateTime.Now
                    };
                    da.shopping_carts.InsertOnSubmit(cart);
                    da.SubmitChanges();
                }

                // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
                var existingItem = da.cart_items.FirstOrDefault(
                    ci => ci.cart_ID == cart.cart_ID && ci.Product_ID == productId
                );

                if (existingItem != null)
                {
                    // Cập nhật số lượng
                    existingItem.quantity += quantity;
                    cart.update_at = DateTime.Now;
                }
                else
                {
                    // Thêm mới
                    var cartItem = new cart_item
                    {
                        cart_ID = cart.cart_ID,
                        Product_ID = productId,
                        quantity = quantity,
                        Sale_Price = product.Sale_Price
                    };
                    da.cart_items.InsertOnSubmit(cartItem);
                    cart.update_at = DateTime.Now;
                }

                da.SubmitChanges();
                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in AddToCart: {ex.Message}");
                return false;
            }
        }

        // Get or Create Cart
        public shopping_cart GetOrCreateCart(int userId)
        {
            var cart = da.shopping_carts.FirstOrDefault(c => c.ID_user == userId);

            if (cart == null)
            {
                cart = new shopping_cart
                {
                    ID_user = userId,
                    day_create = DateTime.Now,
                    update_at = DateTime.Now
                };
                da.shopping_carts.InsertOnSubmit(cart);
                da.SubmitChanges();
            }

            return cart;
        }

        // Lấy số lượng sản phẩm trong giỏ hàng
        public int GetCartItemCount(int userId)
        {
            try
            {
                var cart = da.shopping_carts.FirstOrDefault(c => c.ID_user == userId);

                if (cart == null)
                    return 0;

                return da.cart_items
                    .Where(ci => ci.cart_ID == cart.cart_ID)
                    .Count();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error in GetCartItemCount: " + ex.Message);
                return 0;
            }
        }

        // Lấy danh sách sản phẩm trong giỏ hàng
        public List<CartItem> GetCartItems(int userId)
        {
            try
            {
                var cart = da.shopping_carts.FirstOrDefault(c => c.ID_user == userId);

                if (cart == null)
                    return new List<CartItem>();

                List<CartItem> cartItems = (from ci in da.cart_items
                                            where ci.cart_ID == cart.cart_ID
                                            join p in da.Products on ci.Product_ID equals p.Product_ID
                                            select new CartItem
                                            {
                                                CartItemId = ci.cart_item_ID,
                                                ProductId = p.Product_ID,
                                                ProductName = p.Product_name,
                                                ImageUrl = p.Product_Image,
                                                Price = ci.Sale_Price ?? p.Sale_Price ?? 0,
                                                Quantity = ci.quantity ?? 1
                                            }).ToList();

                return cartItems;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error in GetCartItems: " + ex.Message);
                return new List<CartItem>();
            }
        }

        // =====================================================
        // NOTIFICATION METHODS
        // =====================================================

        // Lấy số lượng thông báo chưa đọc
        public int GetUnreadNotificationCount(int userId)
        {
            try
            {
                return da.Notifications
                    .Where(n => n.ID_user == userId && n.IsRead == false)
                    .Count();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error in GetUnreadNotificationCount: " + ex.Message);
                return 0;
            }
        }

        // Lấy danh sách thông báo
        public List<NotificationItem> GetUserNotifications(int userId, int count)
        {
            try
            {
                return da.Notifications
                    .Where(n => n.ID_user == userId)
                    .OrderByDescending(n => n.Created_At)
                    .Take(count)
                    .Select(n => new NotificationItem
                    {
                        Id = n.Notification_ID,
                        Title = n.Title,
                        Content = n.Message,
                        IsRead = n.IsRead ?? false,
                        CreatedDate = n.Created_At ?? DateTime.Now,
                        Type = n.Type,
                        RelatedId = n.Related_ID
                    })
                    .ToList();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("Error in GetUserNotifications: " + ex.Message);
                return new List<NotificationItem>();
            }
        }

        // =====================================================
        // SECURITY METHODS
        // =====================================================

        // Hash password
        public string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        // Verify password
        public bool VerifyPassword(string inputPassword, string storedPassword)
        {
            return HashPassword(inputPassword) == storedPassword;
        }

        // =====================================================
        // SEARCH METHODS
        // =====================================================

        // Quick search cho autocomplete (hiển thị dropdown khi gõ)
        public List<SearchResultItem> QuickSearchProducts(string searchTerm, int maxResults = 5)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm) || searchTerm.Length < 2)
                    return new List<SearchResultItem>();

                var results = da.sp_QuickSearchProducts(searchTerm, maxResults).ToList();

                return results.Select(r => new SearchResultItem
                {
                    ProductId = r.Product_ID,
                    ProductName = r.Product_name,
                    SalePrice = r.Sale_Price ?? 0,
                    OriginalPrice = r.Original_Price ?? 0,
                    ProductImage = r.Product_Image,
                    TypeProductName = r.Type_Product_name,
                    SimilarityScore = r.SimilarityScore ?? 0
                }).ToList();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in QuickSearchProducts: {ex.Message}");
                return new List<SearchResultItem>();
            }
        }

        // Full search cho trang kết quả tìm kiếm
        public SearchResultViewModel SearchProducts(
            string searchTerm,
            decimal minSimilarity = 30.0M,
            int pageNumber = 1,
            int pageSize = 20,
            int typeProductID =2)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return new SearchResultViewModel
                    {
                        Products = new List<Product_Infomation>(),
                        SearchTerm = searchTerm,
                        TotalResults = 0,
                        CurrentPage = pageNumber,
                        PageSize = pageSize,
                        TotalPages = 0
                    };
                }

                var results = da.sp_SearchProducts(
                    searchTerm,
                    minSimilarity,
                    pageNumber,
                    pageSize,
                    typeProductID
                ).ToList();

                var products = results.Select(r => new Product_Infomation
                {
                    product_id = r.Product_ID,
                    product_name = r.Product_name,
                    sale_price = r.Sale_Price ?? 0,
                    original_price = r.Original_Price ?? 0,
                    images = r.Product_Image,
                    current_Quantity = r.Current_Quantity,
                    product_status = r.Product_Status,
                    type_product = r.Type_Product_name,
                    supplier_name = r.supplier_name,
                    is_featured = r.Is_Featured ?? false,
                    is_new = r.Is_New ?? false,
                    total_sold = r.Total_Sold,
                    product_description = new List<string>() // Có thể load sau nếu cần
                }).ToList();

                int totalResults = results.FirstOrDefault()?.TotalRecords ?? 0;

                return new SearchResultViewModel
                {
                    Products = products,
                    SearchTerm = searchTerm,
                    TotalResults = totalResults,
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalResults / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in SearchProducts: {ex.Message}");
                return new SearchResultViewModel
                {
                    Products = new List<Product_Infomation>(),
                    SearchTerm = searchTerm,
                    TotalResults = 0,
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    TotalPages = 0
                };
            }
        }
    }
}