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
	r.POST("/checkIntersection", geoapi.Intersection)
	return r
}
