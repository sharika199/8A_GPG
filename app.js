const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const server = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () =>
      console.log("Server Running at http://localhost:4000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
server();

//1
const c1 = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const c2 = (requestQuery) => {
  return;
  requestQuery.priority !== undefined;
};

const c3 = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let date = null;
  let getY = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case c1(request.query):
      getY = `
             SELECT
               *
              FROM
              todo
              WHERE
               todo LIKE '%${search_q}%'
               AND status='${status}'
               AND priority ='${priority}';`;
      break;
    case c2(request.query):
      getY = `
              SELECT
               *
               FROM
               todo
               WHERE
                todo LIKE '%${search_q}%'
                AND  priority ='${priority}';`;
      break;
    case c3(request.query):
      getY = `
           SELECT 
           *
           FROM
           todo
           WHERE
            todo LIKE '%${search_q}%'
            AND  status = '${status}';`;
      break;
    default:
      getY = `
            SELECT
             *
             FROM
             todo
             WHERE
              todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getY);
  response.send(data);
});
//2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getBooksQuery = `
    SELECT
      *
    FROM
     todo
     WHERE
     id= ${todoId};`;
  const booksArray = await db.get(getBooksQuery);
  response.send(booksArray);
});

//3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const getBooksQuery = `
    INSERT INTO
      todo (id, todo, priority, status)
    VALUES
     (${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(getBooksQuery);
  response.send("Todo Successfully Added");
});

//4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const requestBody = request.body;

  let updateColumn = "";

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
   SELECT
      *
    FROM
     todo
     WHERE
     id=${todoId};`;
  const previousTodo = await db.run(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodo = `
   UPDATE
    todo
    SET
      toto='${todo}',
      priority='${priority}',
      status='${status}'
      WHERE
      id=${todoId};`;
  await db.run(updateTodo);
  response.send(`${updateColumn} Updated`);
});

//5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQ = `
      DELETE FROM
        todo
        WHERE
        id=${todoId};`;

  await db.run(deleteQ);
  response.send("Todo Deleted");
});

module.exports = app;
