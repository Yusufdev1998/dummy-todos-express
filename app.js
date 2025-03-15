import express from "express";

const app = express();
let todos = [];
function getNextId() {
  return Math.max(...todos.map(t => t.id), 0) + 1;
}

app.use(express.json());
// test
app.get("/", (req, res) => {
  res.send("Server is up");
});

// TODOS - READ(ALL);
app.get("/todos", (req, res) => {
  const query = req.query;
  let limit = query.limit ? +query.limit : 30;
  let skip = query.skip ? +query.skip : 0;

  const filteredTodos = todos.filter(
    (_, index) => index > skip - 1 && index < limit + skip
  );
  res.send({
    todos: filteredTodos,
    total: todos.length,
    skip: skip,
    limit: limit,
  });
});

// TODOS - READ(single - random);
app.get("/todos/random", (req, res) => {
  const todo = todos[Math.floor(Math.random() * todos.length)];
  res.send(todo);
});
// TODOS - READ(single);
app.get("/todos/:id", (req, res) => {
  const id = +req.params.id;
  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).send({ msg: "Todo not found" });
  }
  res.send(todo);
});

// TODOS - READ - BY USER ID
app.get("/todos/user/:id", (req, res) => {
  const query = req.query;
  const userId = +req.params.id;
  let limit = query.limit ? +query.limit : 30;
  let skip = query.skip ? +query.skip : 0;

  const filterByUserId = todos.filter(todo => todo.userId === userId);

  const filteredTodos = filterByUserId.filter(
    (_, index) => index > skip - 1 && index < limit + skip
  );
  res.send({
    todos: filteredTodos,
    total: todos.length,
    skip: skip,
    limit: limit,
  });
});

// TODOS - CREATE
app.post("/todos/add", (req, res) => {
  const todo = req.body;
  const id = getNextId();
  const newTodo = {
    id: id,
    todo: todo.todo,
    completed: todo.completed,
    userId: todo.userId,
  };
  todos.push(newTodo);

  res.status(201).send(newTodo);
});

// TODOS - UPDATE(single)
app.put("/todos/:id", (req, res) => {
  const id = +req.params.id;
  const body = req.body;

  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).send({ msg: "Todo not found" });
  }
  todo.todo = body.todo ? body.todo : todo.todo;
  todo.completed = body.completed ? body.completed : todo.completed;

  res.status(200).send({ msg: "Updated successfully" });
});
// TODOS - DEL(single)
app.delete("/todos/:id", (req, res) => {
  const id = +req.params.id;

  const index = todos.findIndex(todo => todo.id === id);
  if (index > -1) {
    todos.splice(index, 1);
    res.send({ msg: "Deleted successfully" });
  } else {
    res.status(404).send({ msg: "Todo not found" });
  }
});
async function startServer() {
  const res = await fetch("https://dummyjson.com/todos?limit=0");
  const data = await res.json();

  todos = data.todos;

  const PORT = 3000;

  app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
  });
}

startServer();
