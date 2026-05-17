package routes

import (
	"github.com/Wei-Shaw/sub2api/internal/handler"

	"github.com/gin-gonic/gin"
)

const publicGPTEarlyBirdModelsPath = "/gpt-early-bird/models"

// RegisterChannelPublicRoutes registers channel routes that are intentionally
// available without authentication.
func RegisterChannelPublicRoutes(v1 *gin.RouterGroup, h *handler.Handlers) {
	public := v1.Group("/channels/public")
	{
		public.GET(publicGPTEarlyBirdModelsPath, h.AvailableChannel.ListPublicGPTEarlyBirdModels)
	}
}
