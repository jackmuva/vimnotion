package graphdb

import (
	"context"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"vimnotion.com/server/utils"
)

func ConnectGraphDriver() {
	ctx := context.Background()
	envPointer := utils.GetEnv()
	envVars := *envPointer
	driver, err := neo4j.NewDriverWithContext(
		envVars.Neo4jUri,
		neo4j.BasicAuth(envVars.Neo4jUsername, envVars.Neo4jPassword, ""))
	defer driver.Close(ctx)

	err = driver.VerifyConnectivity(ctx)
	if err != nil {
		panic(err)
	}
}
