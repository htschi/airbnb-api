// Require Packages
const createError = require('http-errors')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const { DB_URL } = require('./db')

// Import Mongoose Models

const Bookings = require('./models/bookings')
const Houses = require('./models/houses')
const Reviews = require('./models/reviews')
const Users = require('./models/users')

// Build the App
const app = express()

// Middleware
app.use(logger('tiny'))
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

// Database
mongoose.connect(
  DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => {
    console.log('Connected to MongoDB')
  }
)

// Security
require('./express-sessions')(app)

// Routes
app.get('/', async (req, res) => {
  console.log(req.query)
  res.send('Hello from SignUp')
})

// Houses
app.get('/houses', async (req, res) => {
  console.log(req.query)
  res.send('Hello from Houses')
})

app.get('/houses/:id', async (req, res) => {
  console.log(req.params.id)
  res.send('Hello from Houses id')
})

app.post('/houses', async (req, res) => {
  console.log(req.body)
  res.send('Hello to Houses')
})

app.patch('/houses/:id', async (req, res) => {
  console.log(req.params.id)
  res.send('Hello from Houses id')
})

// Bookings
app.get('/bookings', async (req, res) => {
  console.log(req.query)
  res.send('Hello from Bookings')
})

// Reviews
app.get('/reviews', async (req, res) => {
  console.log(req.query)
  res.send('Hello from Reviews')
})

app.get('/profile', async (req, res) => {
  console.log(req.query)
  res.send('Hello from Profile')
})

app.patch('/profile', async (req, res) => {
  console.log(req.query)
  res.send('Hello from Profile')
})

// Login / Sign Up / Log Out
app.post('/login', async (req, res) => {
  try {
    // find the user in the Users Database
    let loginUser = await Users.findOne({
      email: req.body.email,
      password: req.body.password,
    })
    // if not exist, show error
    if (!loginUser) {
      res.send('User does not exist')
    } else {
      // if exist, create a session
      req.login(loginUser, (err) => {
        if (err) {
          throw err
        }
        res.send(loginUser)
      })
    }
  } catch (err) {
    throw err
  }
})

app.post('/signup', async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email })
    if (!user) {
      let user = await Users.create(req.body)
      res.send(user)
    } else {
      res.send('User exists')
    }
  } catch (err) {
    res.send(err)
  }
})

app.get('/logout', async (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.session.destroy(function (err) {
      if (err) {
        return next(err)
      }
      res.clearCookie('connect.sid')
      res.send('Logged out')
    })
  })
})

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error Handler
app.use((err, req, res, next) => {
  // Respond with an error
  res.status(err.status || 500)
  res.send({
    message: err,
  })
})

module.exports = app
