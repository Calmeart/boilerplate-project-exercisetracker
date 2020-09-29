const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const User = require('./models/model-user');
const Exercise = require('./models/model-exercise');

const cors = require('cors')
require('dotenv').config();

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true});
mongoose.connection.on('connected', () => {
  console.log('Database connection is established!')
});


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req,res) => {
  const {username} = req.body;

  if (!username) {
    return res.json({error: 'Please add a username'})
  }

  User.findOne({username})
  .then(user => {
    if (user) {
      return res.json({error: `User already exists with id: ${user._id}`})
    };
    var tempUser = new User({
      username: req.body.username
    });
    tempUser.save()
    .then(data => res.json({message: `User is created with id: ${data._id}`}))
    .catch(err => console.log(err));
  })
})

app.post('/api/exercise/add', (req, res) => {
  const {userId, description, duration} = req.body;
  const date = new Date(req.body.date).toISOString() || new Date().toISOString();

  console.log(date);



  if (!userId || !description || !duration || !date) {
    return res.json({error: 'Please fill required fields'})
  }
  var tempExercise = new Exercise({
    userId,
    description,
    duration,
    date
  });

  tempExercise.save()
  .then(data => res.json({message: 'Exercise is saved'}))
  .catch(err => console.log(err));
})

app.get('/api/exercise/log', (req,res) => {
  const {userId, limit} = req.query;
  const from = new Date(req.query.from).toISOString() || new Date(0).toISOString();
  const to = new Date(req.query.to).toISOString() || new Date().toISOString();

  console.log(from, to, limit);

  Exercise.find({userId})
    .sort({"date": -1})
    .where("date")
    .gte(from)
    .lte(to)
    .limit(Number(limit))
    .select("-_id -userId -__v")
    .then(data => res.json(data))
    .catch(err => console.log(err));

})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
