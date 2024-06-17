package main

import (
	"fmt"
	"geonius/config"
	"geonius/database"
	"geonius/routes"
	"os"

	cors "github.com/AdhityaRamadhanus/fasthttpcors"
	"github.com/valyala/fasthttp"
)

func runServer() {
	appRouter := routes.Init()
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	fmt.Printf("Server run localhost:%s\n", port)

	withCors := cors.NewCorsHandler(cors.Options{
		// if you leave allowedOrigins empty then fasthttpcors will treat it as "*"
		AllowedOrigins: []string{}, // Only allow example.com to access the resource
		// if you leave allowedHeaders empty then fasthttpcors will accept any non-simple headers
		AllowedHeaders: []string{}, // only allow x-something-client and Content-Type in actual request
		// if you leave this empty, only simple method will be accepted
		AllowedMethods:   []string{"PUT", "PATCH", "GET", "POST", "DELETE"}, // only allow get or post to resource
		AllowCredentials: false,                                             // resource doesn't support credentials
		AllowMaxAge:      5600,                                              // cache the preflight result
		Debug:            true,
	})
	fasthttp.ListenAndServe(fmt.Sprintf(":%s", port), withCors.CorsMiddleware(appRouter.Handler))
}

// main() to initialize and run application server
func main() {
	config.Init()
	database.InitPostgres()
	runServer()
}
