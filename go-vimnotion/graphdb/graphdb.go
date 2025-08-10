package graphdb

import (
	"context"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"vimnotion.com/server/utils"
)

func ConnectGraphDriver() {
	ctx := context.Background()
	driver, err := neo4j.NewDriverWithContext(
		utils.GetEnv().Neo4jUri,
		neo4j.BasicAuth(utils.GetEnv().Neo4jUsername, utils.GetEnv().Neo4jPassword, ""))
	defer driver.Close(ctx)

	err = driver.VerifyConnectivity(ctx)
	if err != nil {
		panic(err)
	}
}
