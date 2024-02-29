package router

import (
	"widgetz/api"

	httprouter "github.com/fasthttp/router"
	"github.com/valyala/fasthttp"
)

func RequestHandler() fasthttp.RequestHandler {
	r := httprouter.New()
	r.GET("/scan", api.Scan)
	return r.Handler
}
