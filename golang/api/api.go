package api

import (
	"encoding/json"

	"github.com/valyala/fasthttp"
)

func NotFoundError(ctx *fasthttp.RequestCtx) {
	ctx.SetStatusCode(404)
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte("{\"error\": \"not_found\"}"))
}

func InternalError(ctx *fasthttp.RequestCtx) {
	ctx.SetStatusCode(500)
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte("{\"error\": \"internal_server\"}"))
}

func UnauthorizeError(ctx *fasthttp.RequestCtx) {
	ctx.SetStatusCode(401)
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte("{\"error\": \"unauthorize\"}"))
}

func SuccessJSON(ctx *fasthttp.RequestCtx, data interface{}) {
	jsonByte, _ := json.Marshal(data)
	ctx.Success("application/json", jsonByte)
}
