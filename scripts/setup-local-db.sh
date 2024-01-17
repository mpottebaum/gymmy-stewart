sqlite3 infra/dev.db ""

atlas schema apply --env local --to file://infra/schema.hcl
