// Define an environment named "local"
env "local" {
  // Declare where the schema definition resides.
  // Also supported: ["file://multi.hcl", "file://schema.hcl"].
  src = "file://infra/schema.hcl"

  // Define the URL of the database which is managed
  // in this environment.
  url = "sqlite://infra/dev.db"

  // Define the URL of the Dev Database for this environment
  // See: https://atlasgo.io/concepts/dev-database
  dev = "sqlite://infra/dev.db"
}
