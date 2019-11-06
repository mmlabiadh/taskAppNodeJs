const express = require('express');
require('./db/mongoose');
const User = require('./models/user');
const Task = require('./models/task');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send(user);
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/users/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password', 'email', 'age'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates' });
  }
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      req.body, { new: true, runValidators: true });
    if (!user) {
      res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).send(task);
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates' });
  }
  try {
    const task = await Task.findByIdAndUpdate(req.params.id,
      req.body, { new: true, runValidators: true });
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
