const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'geolocation',
  password: '7374',
  port: 5433,
})

const getUsers = (request, response) => {
  pool.query('SELECT * FROM tbl_user ORDER BY gid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM tbl_user WHERE gid = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}
const checkIntersection = (request, response) => {
    const { longitude, latitude } = request.body
    pool.query('Select * from geofence_pak where st_intersects(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326))', [longitude, latitude], (error, results) => {
      if (error) {
        // throw error
        console.log(error);
      } else {
        response.status(200).json(results.rows)
      }
    })
}

const addLocation = (request, response) => {
  const { city, country, zip_code, lat, lon, ip } = request.body
  let date_time = new Date();
  let date = ("0" + date_time.getDate()).slice(-2);
  let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
  let year = date_time.getFullYear();
  let hours = date_time.getHours();
  let minutes = date_time.getMinutes();
  let seconds = date_time.getSeconds();
  const current_datetime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
  pool.query("INSERT INTO accessed_locations (city, country, zipcode, lat, lon, ip, datetime) VALUES ($1, $2, $3, $4, $5, $6, $7)", [city, country, zip_code, lat, lon, ip, current_datetime], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Location added with ID: ${results.insertId}`)
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

module.exports = {
  getUsers,
  getUserById,
  addLocation,
  checkIntersection,
  updateUser,
  deleteUser,
}