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
const houses = require('./models/houses')

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

function isAuthenticated(req, res, next) {
  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    // User is authenticated, proceed to the next middleware or route handler
    return next()
  } else {
    console.log('Not authorized')
    res.status(401).json({ error: 'Not authorized' })
    res.redirect('/login')
  }
}

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
  try {
    const rooms = req.query.rooms
    const price = req.query.price
    // const sort = req.query.sort
    const location = req.query.location
    const name = req.query.name

    // Empty query to collect the data we have
    const query = {}

    if (rooms) {
      query.rooms = rooms
    }
    if (price) {
      query.price = price
    }
    // // if (sort) {
    // //   query.sort = sort
    // // }
    if (location) {
      query.location = location
    }
    if (name) {
      query.name = name
    }

    // use the query to find the result in the database, houselist is the arr with the result
    // query is the arr with the searching inputs
    let housesList = await Houses.find(query)
    res.send(housesList)
  } catch (err) {
    throw err
  }
})

// not working
app.get('/houses/:id', async (req, res) => {
  let oneHouse = await Houses.findById(req.params.id).populate('host')
  console.log(oneHouse)
  res.send(oneHouse)
})

app.post('/houses', isAuthenticated, async (req, res) => {
  try {
    // add user id to the
    req.body.host = req.user._id
    // create house object
    let houses = await Houses.create(req.body)
    res.send(houses)
  } catch (err) {
    throw err
  }
})

app.patch('/houses/:id', isAuthenticated, async (req, res) => {
  console.log(req.params.id)
  res.send('Hello from Houses id')
})

// Bookings
app.get('/bookings', async (req, res) => {
  console.log(req.query)
  res.send('Hello from Bookings')
})

app.post('/bookings', isAuthenticated, async (req, res) => {
  console.log(req.query)
  res.send('Hello to Bookings')
})

// Reviews
app.get('/reviews', async (req, res) => {
  console.log(req.query)
  res.send('Hello from Reviews')
})

app.post('/reviews', isAuthenticated, async (req, res) => {
  console.log(req.query)
  res.send('Hello to Reviews')
})

app.get('/profile', isAuthenticated, async (req, res) => {
  console.log(req.query)
  res.send('Hello from Profile')
})

app.patch('/profile', isAuthenticated, async (req, res) => {
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

app.get('/logout', (req, res) => {
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
