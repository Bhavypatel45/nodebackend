const express = require('express')
const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://Bhavyghaghra:Bhavy_45@cluster0.xfps2gd.mongodb.net/?retryWrites=true&w=majority"

const connectedToMongo = ()=> {
    mongoose.connect(mongoURI, ()=>{
        console.log("sucess!!");
    })
}

connectedToMongo()
const app = express()
const port = 5000
const cors = require("cors");
app.use(cors());

app.use(express.json())

// routes
app.use('/api/auth', require("./router/auth.js"))
app.use('/api/notes', require("./router/notes.js"))

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
