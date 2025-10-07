using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


namespace Web_Beta.Models
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

    }
}