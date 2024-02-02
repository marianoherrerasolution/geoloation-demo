package routes

import (
	"geonius/api"
	adminsapi "geonius/api/admins"
	geoipsapi "geonius/api/geoips"
	geoapi "geonius/api/geos"
	locationsapi "geonius/api/locations"
	sessionsapi "geonius/api/sessions"
	usersapi "geonius/api/users"
	vpnsapi "geonius/api/vpns"
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

		if !encrypt.ValidateRequest(string(authByte), accessType) {
			api.UnauthorizeError(ctx)
			return
		}
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
	rV2.POST("/signin", sessionsapi.Signin)
	rV2.POST("/signup", sessionsapi.Signup)
	rV2.POST("/lookup", authToken(vpnsapi.Detect, "member"))
	rV2.POST("/location/intersect", authToken(geoapi.Intersection, "member"))
	rV2.POST("/location/add", authToken(geoapi.AddLocation, "member"))

	rV2.GET("/profile", authToken(usersapi.Update, "member"))
	rV2.POST("/profile/update", authToken(usersapi.Show, "member"))

	rV2.POST("/vpn/check", authToken(vpnsapi.Detect, "member"))

	rV2.POST("/users", authToken(usersapi.List, "admin"))
	rV2.GET("/users/{id}", authToken(usersapi.Show, "admin"))
	rV2.PUT("/users/{id}", authToken(usersapi.Update, "admin"))
	rV2.DELETE("/users/{id}", authToken(usersapi.Delete, "admin"))
	rV2.POST("/users", authToken(usersapi.Create, "admin"))

	rV2.POST("/admins", authToken(adminsapi.List, "admin"))
	rV2.GET("/admins/{id}", authToken(adminsapi.Show, "admin"))
	rV2.PUT("/admins/{id}", authToken(adminsapi.Update, "admin"))
	rV2.DELETE("/admins/{id}", authToken(adminsapi.Delete, "admin"))
	rV2.POST("/admins", authToken(adminsapi.Create, "admin"))

	rV2.POST("/locations", authToken(locationsapi.List, "admin"))
	rV2.GET("/locations/{id}", authToken(locationsapi.Show, "admin"))
	rV2.DELETE("/locations/{id}", authToken(locationsapi.Delete, "admin"))

	rV2.POST("/geoips", authToken(geoipsapi.List, "admin"))
	rV2.GET("/geoips/{id}", authToken(geoipsapi.Show, "admin"))
	rV2.DELETE("/geoips/{id}", authToken(geoipsapi.Delete, "admin"))
	return r
}
