package main

import (
	"fmt"
	"geonius/routes"
	"os"

	"github.com/valyala/fasthttp"
)

// main() to initialize and run application server
func main() {
	appRouter := routes.Init()
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	fmt.Printf("Server run localhost:%s\n", port)
	fasthttp.ListenAndServe(fmt.Sprintf(":%s", port), appRouter.Handler)
}
