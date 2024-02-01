package api

import (
	"encoding/json"

	"github.com/valyala/fasthttp"
)

type ErrorConfig struct {
	Error string `json:"error"`
	Field string `json:"field,omitempty"`
}

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

func UnprocessibleError(ctx *fasthttp.RequestCtx, errConf ErrorConfig) {
	ctx.SetStatusCode(422)
	ctx.SetContentType("application/json")
	bodyByte, _ := json.Marshal(errConf)
	ctx.SetBody(bodyByte)
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
