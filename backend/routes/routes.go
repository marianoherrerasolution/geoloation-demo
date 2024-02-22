package routes

import (
	"geonius/api"
	adminsapi "geonius/api/admins"
	clientsapi "geonius/api/clients"
	geoipsapi "geonius/api/geoips"
	geoapi "geonius/api/geos"
	locationsapi "geonius/api/locations"
	productsapi "geonius/api/products"
	profileapi "geonius/api/profile"
	restrictionsapi "geonius/api/restrictions"
	sessionsapi "geonius/api/sessions"
	usersapi "geonius/api/users"
	vpnsapi "geonius/api/vpns"
	widgetsapi "geonius/api/widgets"
	"geonius/pkg/encrypt"

	"github.com/fasthttp/router"
	"github.com/valyala/fasthttp"
)

func authToken(handler fasthttp.RequestHandler, accessType string) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		authByte := ctx.Request.Header.Peek("Authorization")
		if authByte == nil {
			api.UnauthorizeError(ctx)
			return
		}

		ok, userIDTxt := encrypt.ValidateRequest(string(authByte), accessType)
		if !ok {
			api.UnauthorizeError(ctx)
			return
		}
		ctx.SetUserValue("userType", accessType)
		ctx.SetUserValue("userID", userIDTxt)
		handler(ctx)
	}
}

// Init() to initialize routers
func Init() *router.Router {
	r := router.New()
	r.GET("/vpn", vpnsapi.Detect)
	r.GET("/users", usersapi.List)
	r.GET("/users/{id}", usersapi.Show)
	r.POST("/users", usersapi.Create)
	r.POST("/users/{email}", usersapi.Login)
	r.PUT("/users/{id}", usersapi.Update)
	r.DELETE("/users/{id}", usersapi.Delete)
	r.POST("/checkIntersection", geoapi.Intersection)
	r.POST("/location", geoapi.AddLocation)

	rV2 := r.Group("/v2")

	// === MEMBER AUTH ====

	rV2.POST("/signin", sessionsapi.Signin)
	rV2.POST("/signup", sessionsapi.Signup)
	rV2.POST("/lookup", authToken(vpnsapi.Detect, "member"))
	rV2.POST("/location/intersect", authToken(geoapi.Intersection, "member"))
	rV2.POST("/location/add", authToken(geoapi.AddLocation, "member"))

	rV2.GET("/profile", authToken(profileapi.Show, "member"))
	rV2.POST("/profile", authToken(profileapi.Update, "member"))

	rV2.POST("/vpn/check", authToken(vpnsapi.Detect, "member"))

	rV2.GET("/u/widgets", authToken(widgetsapi.List, "member"))
	rV2.GET("/u/widgets/{id}", authToken(widgetsapi.Show, "member"))
	rV2.PUT("/u/widgets/{id}", authToken(widgetsapi.Update, "member"))
	rV2.DELETE("/u/widgets/{id}", authToken(widgetsapi.Delete, "member"))
	rV2.POST("/u/widgets", authToken(widgetsapi.Create, "member"))
	
	rV2.GET("/u/restrictions", authToken(restrictionsapi.List, "member"))
	rV2.GET("/u/restrictions/select", authToken(restrictionsapi.Select, "member"))
	rV2.GET("/u/restrictions/{id}", authToken(restrictionsapi.Show, "member"))
	rV2.PUT("/u/restrictions/{id}", authToken(restrictionsapi.Update, "member"))
	rV2.DELETE("/u/restrictions/{id}", authToken(restrictionsapi.Delete, "member"))
	rV2.POST("/u/restrictions", authToken(restrictionsapi.Create, "member"))

	rV2.GET("/u/products", authToken(productsapi.List, "member"))
	rV2.GET("/u/products/select", authToken(productsapi.Select, "member"))
	rV2.GET("/u/products/{id}", authToken(productsapi.Show, "member"))
	rV2.PUT("/u/products/{id}", authToken(productsapi.Update, "member"))
	rV2.DELETE("/u/products/{id}", authToken(productsapi.Delete, "member"))
	rV2.POST("/u/products", authToken(productsapi.Create, "member"))

	// ==== ADMIN AUTH =====


	rV2.GET("/users", authToken(usersapi.List, "admin"))
	rV2.GET("/users/{id}", authToken(usersapi.Show, "admin"))
	rV2.PUT("/users/{id}", authToken(usersapi.Update, "admin"))
	rV2.DELETE("/users/{id}", authToken(usersapi.Delete, "admin"))
	rV2.POST("/users", authToken(usersapi.Create, "admin"))

	rV2.GET("/admins", authToken(adminsapi.List, "admin"))
	rV2.POST("/admin/signin", adminsapi.Login)
	rV2.GET("/admins/{id}", authToken(adminsapi.Show, "admin"))
	rV2.PUT("/admins/{id}", authToken(adminsapi.Update, "admin"))
	rV2.DELETE("/admins/{id}", authToken(adminsapi.Delete, "admin"))
	rV2.POST("/admins", authToken(adminsapi.Create, "admin"))

	rV2.GET("/locations", authToken(locationsapi.List, "admin"))
	rV2.GET("/locations/{id}", authToken(locationsapi.Show, "admin"))
	rV2.DELETE("/locations/{id}", authToken(locationsapi.Delete, "admin"))

	rV2.GET("/geoips", authToken(geoipsapi.List, "admin"))
	rV2.GET("/geoips/{id}", authToken(geoipsapi.Show, "admin"))
	rV2.DELETE("/geoips/{id}", authToken(geoipsapi.Delete, "admin"))

	rV2.GET("/clients", authToken(clientsapi.List, "admin"))
	rV2.GET("/clients/select", authToken(clientsapi.Select, "admin"))
	rV2.GET("/clients/{id}", authToken(clientsapi.Show, "admin"))
	rV2.PUT("/clients/{id}", authToken(clientsapi.Update, "admin"))
	rV2.DELETE("/clients/{id}", authToken(clientsapi.Delete, "admin"))
	rV2.POST("/clients", authToken(clientsapi.Create, "admin"))

	rV2.GET("/products", authToken(productsapi.List, "admin"))
	rV2.GET("/products/select", authToken(productsapi.Select, "admin"))
	rV2.GET("/products/{id}", authToken(productsapi.Show, "admin"))
	rV2.PUT("/products/{id}", authToken(productsapi.Update, "admin"))
	rV2.DELETE("/products/{id}", authToken(productsapi.Delete, "admin"))
	rV2.POST("/products", authToken(productsapi.Create, "admin"))

	rV2.GET("/widgets", authToken(widgetsapi.List, "admin"))
	rV2.GET("/widgets/{id}", authToken(widgetsapi.Show, "admin"))
	rV2.PUT("/widgets/{id}", authToken(widgetsapi.Update, "admin"))
	rV2.DELETE("/widgets/{id}", authToken(widgetsapi.Delete, "admin"))
	rV2.POST("/widgets", authToken(widgetsapi.Create, "admin"))

	rV2.GET("/restrictions", authToken(restrictionsapi.List, "admin"))
	rV2.GET("/restrictions/select", authToken(restrictionsapi.Select, "admin"))
	rV2.GET("/restrictions/{id}", authToken(restrictionsapi.Show, "admin"))
	rV2.PUT("/restrictions/{id}", authToken(restrictionsapi.Update, "admin"))
	rV2.DELETE("/restrictions/{id}", authToken(restrictionsapi.Delete, "admin"))
	rV2.POST("/restrictions", authToken(restrictionsapi.Create, "admin"))
	return r
}
