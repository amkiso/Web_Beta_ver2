using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;

namespace Web_Beta_ver2.Models
{
    public class Product_Infomation
    {
        

        public string product_name { get; set; }
        public int product_id { get; set; }
        public List<string> product_description { get; set; }
        public string supplier_name { get; set; }
        public string product_status { get; set; }
        public decimal sale_price { get; set; }
        public int current_Quantity { get; set; }
        public string images { get; set; }
        public string type_product { get; set; }

        // Thêm các trường mới cho việc lọc và sắp xếp
        // Note: Các field này cần được thêm vào database hoặc tính toán từ dữ liệu hiện có
        public decimal original_price { get; set; } // Có thể lưu trong JSON description
        public int total_sold { get; set; } // Tính từ Orders_item
        public bool is_featured { get; set; } // Có thể thêm vào Products table
        public bool is_new { get; set; } // Có thể dựa vào ngày tạo
        public DateTime created_date { get; set; } // Cần thêm vào Products table

        // Computed property để tính % giảm giá
        public decimal DiscountPercent
        {
            get
            {
                if (original_price > 0 && original_price > sale_price)
                    return Math.Round(((original_price - sale_price) / original_price) * 100);
                return 0;
            }
        }

        // Property kiểm tra còn hàng
        public bool IsInStock
        {
            get
            {
                return current_Quantity > 0 && product_status == "selling";
            }
        }
    }

    // ViewModel cho trang sản phẩm
    public class ProductFilterViewModel
    {
        public List<Product_Infomation> Products { get; set; }
        public int TypeProductId { get; set; }

        public string CurrentSort { get; set; }
        public string SearchTerm { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int PageSize { get; set; }
        public bool HasMore { get; set; }
        public int TotalProducts { get; set; }
        public string CategoryName { get; set; }
    }

    // ViewModel cho kết quả tìm kiếm
    public class SearchResultViewModel
    {
        public List<Product_Infomation> Products { get; set; }
        public string SearchTerm { get; set; }
        public int TotalResults { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    // Model cho autocomplete search result
    public class SearchResultItem
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public decimal SalePrice { get; set; }
        public decimal OriginalPrice { get; set; }
        public string ProductImage { get; set; }
        public string TypeProductName { get; set; }
        public decimal SimilarityScore { get; set; }
    }
}