const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');
const app = express();
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

app.get('/check-vpn', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.clientIp || req.connection.remoteAddress;
  if (isVPNAddress(clientIp)) {
    res.json({ isUsingVPN: true });
  } else {
    res.json({ isUsingVPN: false });
  }
});
function isVPNAddress(ip) {
  console.log(ip);
  return false;
}

app.get('/users', db.getUsers)
app.get('/vpn', vpn.detectVPNService)
app.get('/users/:id', db.getUserById)
app.post('/location', db.addLocation)
app.post('/checkIntersection', db.checkIntersection)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})