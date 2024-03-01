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

    const successCallback = function(resp) {
      var message = `You are ${resp.data.access}ed to access this page`
      if (resp.data.action == "nothing") {
        return
      }
      if (resp.data.action == "alert") {
        alert(resp.data.message || message)
        return
      }
      if (resp.data.action == "close") {
        window.close()
        return
      }
      if (resp.data.action == "alert_close") {
        alert(resp.data.message || message)
        window.close()
        return
      }
      if (resp.data.action == "alert_redirect") {
        alert(resp.data.message || message)
        window.location = resp.data.redirect
        return
      }
      if (resp.data.action == "redirect") {
        window.location = resp.data.redirect
        return
      }
    }

    const endpoint = "http://localhost:4000/scan?token=${token}&offset=${offset}"
    fetch(endpoint).
    then(successCallback).
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
              fetch(`${endpoint}&latitude=${latitude}&longitude=${longitude}&offset=${offset}`).
              then(successCallback)
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