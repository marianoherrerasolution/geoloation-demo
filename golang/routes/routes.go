package routes

import (
	vpnsapi "geonius/api/vpns"

	"github.com/fasthttp/router"
)

// Init() to initialize routers
func Init() {
	r := router.New()
	r.GET("/vpn", vpnsapi.Detect)
}
