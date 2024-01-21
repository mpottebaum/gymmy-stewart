schema "main" {
}

table "sessions" {
  schema = schema.main
  column "id" {
    type = integer
    auto_increment = true
  }
  column "user_id" {
    type = integer
  }
  primary_key  {
    columns = [column.id]
  }
  foreign_key "user" {
    columns = [column.user_id]
    ref_columns = [table.users.column.id]
  }
}

table "users" {
  schema = schema.main
  column "id" {
    type = integer
    auto_increment = true
  }
  column "username" {
    type = text
  }
  column "password_hash" {
    type = text
  }
  primary_key  {
    columns = [column.id]
  }
  index "unique_usernames" {
    unique = true
    columns = [column.username]
  }
}


table "workouts" {
  schema = schema.main
  column "id" {
    type = integer
    auto_increment = true
  }
  column "user_id" {
    type = integer
  }
  column "title" {
    type = text
    null = true
  }
  column "notes" {
    type = text
    null = true
  }
  column "epoch_date" {
    type = date
  }
  primary_key  {
    columns = [column.id]
  }
  foreign_key "user" {
    columns = [column.user_id]
    ref_columns = [table.users.column.id]
  }
}
