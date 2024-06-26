if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express') // Importing express from the express library
const app = express() // get the app version of express, we'll use this down below to configure the express app
const expressLayouts = require('express-ejs-layouts') // Improrting the express ejs layouts to make sick HTML pages
const indexRouter = require('./routes/index')
app.set('view engine', 'ejs') // Using ejs as the view engine so we set it to that
app.set('views', __dirname + '/views') // Put the views in the views directory
app.set('layout', 'layouts/layout') // Create a layout folder to not repeat headers and footers in the pages we create
app.use(expressLayouts) //Use the express layouts over here
app.use(express.static('public')) //let the server know where we'll be putting our styles, image assets, and javascript
app.use('/', indexRouter)
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('We\'re connected to our based Mongoose database baby!'))
app.listen(process.env.PORT || 3000)