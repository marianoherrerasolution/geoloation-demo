package main

import (
	"flag"
	"fmt"
	config "widgetz/config/database"
	"widgetz/config/env"
	"widgetz/config/router"
	"widgetz/pkg/seed"

	cors "github.com/AdhityaRamadhanus/fasthttpcors"
	"github.com/valyala/fasthttp"
)

// main() to initialize and run application server
// example: go run main.go --env .env --port 3000 --host 0.0.0.0
func main() {
	fileENV := flag.String("env-file", ".env", "file location which contains variable environment")
	host := flag.String("host", "", "server host name, default: localhost")
	port := flag.Int("port", 4000, "server port, default: 4000")
	prod := flag.Bool("production", false, "run app as production")
	isSeed := flag.Bool("seed", false, "run seed data")

	flag.Parse()
	env.Init(*prod, *fileENV)
	if *isSeed {
		seed.Run()
		return
	}
	addr := fmt.Sprintf("%s:%d", *host, *port)
	fmt.Printf("Server run %s\n", addr)
	config.InitPostgres()
	fasthttp.ListenAndServe(addr, CORSPlugin(router.RequestHandler()))
}

func CORSPlugin(innerHandler fasthttp.RequestHandler) fasthttp.RequestHandler {
	return cors.NewCorsHandler(cors.Options{
		AllowedOrigins:   []string{},
		AllowedHeaders:   []string{},
		AllowedMethods:   []string{"GET", "POST"},
		AllowCredentials: false,
		AllowMaxAge:      5600,
		Debug:            false,
	}).CorsMiddleware(innerHandler)
}
