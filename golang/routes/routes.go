package routes

import (
	geoapi "geonius/api/geos"
	usersapi "geonius/api/users"
	vpnsapi "geonius/api/vpns"

	"github.com/fasthttp/router"
)

// Init() to initialize routers
func Init() *router.Router {
	r := router.New()
	r.GET("/vpn", vpnsapi.Detect)
	r.GET("/users", usersapi.List)
	r.GET("/users/{id}", usersapi.Show)
	r.PUT("/users/{id}", usersapi.Update)
	r.DELETE("/users/{id}", usersapi.Delete)
	r.POST("/checkIntersection", geoapi.Intersection)
	r.POST("/addLocation", geoapi.AddLocation)
	return r
}
