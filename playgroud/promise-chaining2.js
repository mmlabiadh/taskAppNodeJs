require('../src/db/mongoose');
const Task = require('../src/models/task');

const deleteTaskAndCount = async (id) => {
  const task = await Task.findByIdAndRemove(id);
  const count = await Task.countDocuments({ completed: false });
  return count;
};
