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

    const callBack = function(data) {
      if (!data) { return }
     var message = `You are ${data.access}ed to access this page`
      if (data.action == "nothing") {
        return
      }
      if (data.action == "alert") {
        alert(data.message || message)
        return
      }
      if (data.action == "close") {
        window.close()
        return
      }
      if (data.action == "alert_close") {
        alert(data.message || message)
        window.close()
        return
      }
      if (data.action == "alert_redirect") {
        alert(data.message || message)
        window.location = data.redirect
        return
      }
      if (data.action == "redirect") {
        window.location = data.redirect
        return
      }
    }

    const successCallback = function(resp) {
      if (!resp) { return }
      if (resp.type == "cors") {
        return resp.json().then(function(data) { callBack(data) })
      }
      return callBack(resp.data)
    }

    const endpoint = `https://widget.geo.taeqr.com/scan?token=${token}&offset=${offset}`
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
