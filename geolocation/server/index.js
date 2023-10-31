const express = require('express')
const bodyParser = require('body-parser')
const app = express();
// ADD THIS
var cors = require('cors');
app.use(cors());
const db = require('./queries')
const vpn = require('./vpn')
const port = 3001

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  runDetect();
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/users', db.getUsers)
app.get('/vpn', vpn.detectVPNService)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.post('/checkIntersection', db.checkIntersection)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})