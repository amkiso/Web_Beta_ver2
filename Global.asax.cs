using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Web_Beta_ver2
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
        protected void Application_Error(object sender, EventArgs e)
        {
            var exception = Server.GetLastError();

            if (exception != null)
            {
                Server.ClearError();

                var httpException = exception as HttpException;
                var routeData = new RouteData();
                routeData.Values["controller"] = "Error";

                if (httpException != null)
                {
                    switch (httpException.GetHttpCode())
                    {
                        case 404:
                            routeData.Values["action"] = "NotFound";
                            break;
                        case 403:
                            routeData.Values["action"] = "Forbidden";
                            break;
                        case 500:
                            routeData.Values["action"] = "InternalError";
                            break;
                        default:
                            routeData.Values["action"] = "Index";
                            break;
                    }
                }
                else
                {
                    routeData.Values["action"] = "InternalError";
                }

                Response.Clear();
                Response.TrySkipIisCustomErrors = true;
                IController errorController = new Controllers.ErrorController();
                errorController.Execute(new RequestContext(new HttpContextWrapper(Context), routeData));
            }
        }
    }
}
