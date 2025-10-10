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

    }
}