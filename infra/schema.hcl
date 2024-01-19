schema "main" {
}

table "workouts" {
  schema = schema.main
  column "id" {
    type = integer
    auto_increment = true
  }
  column "title" {
    type = text
  }
  column "notes" {
    type = text
  }
  column "epoch_date" {
    type = date
  }
  primary_key  {
    columns = [column.id]
  }
}
