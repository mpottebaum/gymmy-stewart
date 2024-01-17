schema "main" {
}

table "workouts" {
  schema = schema.main
  column "id" {
    type = int
  }
  column "utc_date" {
    type = text
  }
  column "title" {
    type = text
  }
  column "notes" {
    type = text
  }
}
