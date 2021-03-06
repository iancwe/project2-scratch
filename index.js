const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('./config/passport')
const flash = require('connect-flash')
const path = require('path')
const isLoggedIn = require('./middleware/isLoggedIn')
const methodOverride = require('method-override')
const MongoStore = require('connect-mongo')(session)
const app = express()
require('dotenv').config({ silent: true })

// mongoose and database set up
const dbURI = process.env.PROD_MONGODB || 'mongodb://localhost/scratch'
const mongoose = require('mongoose')
mongoose.connect(dbURI, function () {
  console.log('db is connected')
})
mongoose.Promise = global.Promise

// setting up sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ url: dbURI })
}))

app.use(passport.initialize())
app.use(passport.session())
// setting up flash
app.use(flash())

app.use(function (req, res, next) {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash()
  res.locals.currentUser = req.user
  next()
})

// setting my template engine for express
app.set('view engine', 'ejs')

// set up method override
app.use(methodOverride('_method'))

// setting the layout structure
var ejsLayout = require('express-ejs-layouts')
app.use(ejsLayout)
app.use(express.static(path.join(__dirname, 'assets')))

// setting up bodyParser to use input forms
app.use(bodyParser.urlencoded({extended: false}))

// setup for landing page for vistors and user
app.get('/', function (req, res) {
  res.render('landing')
})

const authCtrl = require('./controllers/auth')
app.use('/', authCtrl)

// logged in user only
app.use(isLoggedIn)

// setting up controllers for webpage
const overCtrl = require('./routes/overall')
app.use('/', overCtrl)

app.listen(process.env.PORT, function () {
  console.log('express is running now')
})
