schema "main" {
}

table "workouts" {
  schema = schema.main
  column "id" {
    type = int
  }
  column "utc_date" {
    type = varchar(255)
  }
  column "title" {
    type = varchar(255)
  }
  column "notes" {
    type = varchar(255)
  }
}
