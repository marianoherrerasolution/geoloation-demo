const API_KEY = '746ff7ec4d3549ba9dee06fa883e4a47'
const IP_URL = `https://api.ipgeolocation.io/getip`
const LOC_URL = `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=`

function getRealLocation() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}

async function fetchJson(url) {
    return await (await fetch(url)).json()
}

async function getSimulatedLocation() {
    const ip = (await fetchJson(IP_URL)).ip
    return (await fetchJson(LOC_URL + ip)).time_zone.name
}

async function detectVPN() {
    const real = getRealLocation()
    const simulated = await getSimulatedLocation()
    return {
        result: real == simulated,
        real,
        simulated
    }
}

const detectVPNService = async function(request, response) {
  response.status(200).json(await runDetect())
}

async function runDetect() {
  let res;
  try {
      res = await detectVPN()
  }
  catch {}
  return res;
}

module.exports = {
  detectVPNService
}