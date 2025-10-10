using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


namespace Web_Beta_ver2.Models
{
    public class Xuly  
    {
       
        public Xuly() { }
        SQLDataClassesDataContext da = new SQLDataClassesDataContext();
        public List<Product_Infomation> itemproduct ()
        {
            var query = from p in da.Products
                        join s in da.suppliers on p.supplier_ID equals s.supplier_ID
                        join l in da.Type_Products on p.Type_Product_ID equals l.Type_Product_ID
                        select new Product_Infomation
                        {
                            product_id = p.Product_ID,
                            product_name = p.Product_name,
                            product_status = p.Product_Status,
                            sale_price = p.Sale_Price??0,
                            supplier_name = s.supplier_name,
                            images = p.Product_Image,
                            current_Quantity = p.Current_Quantity,
                            type_product = l.Type_Product_name,
                            product_description = p.Descriptions != null
                        ? p.Descriptions.Split(';').ToList()
                        : new List<string>()

                        };
            return query.ToList();
        }
        public bool VerifyPassword(string inputPassword, string storedPassword)
        {
            return HashPassword(inputPassword) == storedPassword;
        }
        public string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
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

        // Lấy số lượng sản phẩm trong giỏ hàng
        public int GetCartItemCount(int userId)
        {
            try
            {
                var cart = da.shopping_carts
                    .FirstOrDefault(c => c.ID_user == userId);

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
                var cart = da.shopping_carts
                    .FirstOrDefault(c => c.ID_user == userId);

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
    }
}