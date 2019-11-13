const express = require('express');
const User = require('../models/user');
const authMiddleware = require('../middleware/authentication');

const router = express.Router();

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/users/me', authMiddleware, async (req, res) => {
  res.send(req.user);
});

router.get('/users/:id', async (req, res) => {
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

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredantials(req.body.email, req.body.password);
    const token = await user.generateToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/users/me', authMiddleware, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password', 'email', 'age'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates' });
  }
  try {
    const { user } = req;
    updates.forEach((update) => { user[update] = req.body[update]; });
    user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/users/me', authMiddleware, async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   res.status(404).send(user);
    // }
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/users/logout', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/users/logoutAll', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
