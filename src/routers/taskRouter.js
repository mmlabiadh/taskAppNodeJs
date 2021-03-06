const express = require('express');
const Task = require('../models/task');
const authMiddleware = require('../middleware/authentication');

const router = express.Router();

router.post('/tasks', authMiddleware, async (req, res) => {
  const task = new Task({
    ...req.body,
    // eslint-disable-next-line no-underscore-dangle
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});


// GET /tasks?completed=true
// GET /tasks?limit=10&&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', authMiddleware, async (req, res) => {
  const match = {};
  const sort = {};
  match.completed = req.query.completed === 'true';
  if (req.query.sortBy) {
    sort[req.query.sortBy.split(':')[0]] = req.query.sortBy.split(':')[1] === 'desc' ? -1 : 1;
  }
  try {
    // eslint-disable-next-line no-underscore-dangle
    // const tasks = await Task.find({ owner: req.user._id });
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit, 10),
        skip: parseInt(req.query.skip, 10),
        sort,
      },
    }).execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      res.status(404).send(task);
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates' });
  }
  try {
    // eslint-disable-next-line no-underscore-dangle
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      res.status(404).send();
    }
    updates.forEach((update) => { task[update] = req.body[update]; });
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    // const task = await Task.findByIdAndDeletez(req.params.id);
    // eslint-disable-next-line no-underscore-dangle
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).send(task);
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
