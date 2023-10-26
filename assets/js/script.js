const src_v = new ol.source.Vector();
const lyr_v = new ol.layer.Vector({
    source: src_v
});
const map = new ol.Map({
  layers: [
    // new ol.layer.Tile({
    //   source: new ol.source.OSM(),
    // }),
    new ol.layer.Tile({
        visible: true,
        preload: Infinity,
        source: new ol.source.BingMaps({
          key: 'Al4sDFvgG8_oa8N4ASrRXBZzOsHj52NqCsdMzgEN7xAcWGlI3bVCv3yEWrvTsuOY',
          imagerySet: 'AerialWithLabelsOnDemand',
        }),
    }),
    lyr_v
  ],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 2
  }),
});


function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert('Geolocation is not supported by this browser.');
    }
    
}
getLocation();
function showPosition(position) {
    var oFeature = new ol.Feature({
        geometry: new ol.geom.Point(
           ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude])
        )
    });
    src_v.addFeature(oFeature);
    var extent = lyr_v.getSource().getExtent();
    map.getView().fit(extent, {
        duration: 3500,
        maxZoom: 15
        // padding: [10, 10, 10, 10]
    });
    // x.innerHTML = "Latitude: " + position.coords.latitude +
    // "<br>Longitude: " + position.coords.longitude;

}

var request = new XMLHttpRequest();

request.open('GET', 'https://api.ipdata.co/?api-key=29e1935df12c6aa92c7bc794f0cfdbd7e57705d62bb6e54037a4a958');

request.setRequestHeader('Accept', 'application/json');

request.onreadystatechange = function () {
  if (this.readyState === 4) {
    console.log(JSON.parse(this.responseText));
    console.log(JSON.parse(this.responseText).ip);
  }
};

request.send();