(
  function(d) {
    var element = d.getElementById("geoniuscript")
    if (!element) {
      return
    }
    var source = element.getAttribute("src")
    if (!source || !source.match(/token=.*?($|&)/gi)) {
      return
    }
    var token = String(source.match(/token=.*?($|&)/gi)).replace(/(token=)|(&$)/gi, "")
    var offset = new Date().getTimezoneOffset()
    const endpoint = "http://localhost:4000/scan?token=${token}&offset=${offset}"
    fetch(endpoint).
    then(function(response) {
      console.log(response)
    }).
    catch(function(err) {
      if (err.status == 401) {
        alert("Geonius token is invalid")
        return
      }
      if (err.status == 400) {
        alert("Your access can not be recognize. Please enable location.")
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const {
                latitude,
                longitude
              } = position.coords;
              fetch(`${endpoint}&latitude=${latitude}&longitude=${longitude}`).
              then(function(resp) {
                console.log(resp)
              }).
              catch({
                if (err.status == 403) {
                  alert("You are not allowed to access this page")
                  return
                }
              })

            },
            (error) => {
              console.error('Error getting user location:', error);
            }
          )
        }
        return
      }
    })
  }
)(document);