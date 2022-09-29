const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// connect to mongodb
mongoose
  .connect('mongodb://127.0.0.1:27017/express-mongo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB...'))
  .catch((err) => console.error('Could not connect to MongoDB...'));

// create a schema
const courseSchema = new mongoose.Schema(
  {
    name: String,
  },
  {
    timestamps: true,
  }
);

// create a model
const Course = mongoose.model('Course', courseSchema);

app.post('/', async (req, res) => {
  // write a program to update a file and backup the old file
  // if the file does not exist, create it
  // if the file exists, backup the old file and update the new file
  // if the backup file exists, delete it

  const filePath = path.join(__dirname, 'data.txt');
  //backup path with format date to YYYYMM-DD--HH_mm
  const backupPath = path.join(
    __dirname,
    `data-${new Date()
      .toISOString()
      .replace(/:/g, '_')
      .replace(/-/g, '_')
      .replace(/\./g, '_')
      .replace('T', '--')}.txt`
  );

  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    fs.unlinkSync(filePath);
  }

  fs.writeFileSync(filePath, req.body.note);

  // send the new file content back to the db

  const course = new Course({
    name: req.body.note,
  });

  await course.save();

  res.send('file written');
});

app.listen(4545, () => {
  console.log('Server is running on port 4545');
});
