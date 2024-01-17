schema "main" {
}

table "workouts" {
  schema = schema.main
  column "id" {
    type = integer
    auto_increment = true
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
  primary_key  {
    columns = [column.id]
  }
}
