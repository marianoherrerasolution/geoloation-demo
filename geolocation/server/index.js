const express = require('express')
// const requestIp = require('request-ip');
const bodyParser = require('body-parser')
const axios = require('axios');
const app = express();
var cors = require('cors');
app.use(cors());
// app.set('trust proxy', true)
const db = require('./queries')
const vpn = require('./vpn')
const port = 3001

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// app.use(requestIp.mw());

// app.use((req, res, next) => {
//   const clientIp = req.clientIp; // This may give you the real client's IP address behind a proxy or VPN
//   console.log('Real Client IP:', clientIp);
//   next();
// });

// app.use(async (req, res, next) => {
//   // const clientIp = req.headers['x-forwarded-for'] || req.clientIp;
//   // Check if the IP address is associated with a VPN using ipinfo.io
//   const clientIp =  '39.58.227.106';
//   try {
//     const response = await axios.get(`https://ipinfo.io/${clientIp}/json`);
//     const { org } = response.data;

//     if (org && org.toLowerCase().includes('vpn')) {
//       console.log('Client is using a VPN.');
//     } else {
//       console.log('Client is not using a VPN.');
//     }
//   } catch (error) {
//     console.error('Error checking VPN status:', error.message);
//   }
//   next();
// });

// app.get('/', (req, res) => {
//   res.send('Hello, World!');
// });

app.get('/users', db.getUsers)
app.get('/vpn', vpn.detectVPNService)
app.get('/users/:id', db.getUserById)
// app.post('/users', db.createUser)
app.post('/checkIntersection', db.checkIntersection)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})