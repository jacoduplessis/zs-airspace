import {wind, timeToMinutes, minutesToTime} from './utils.js'


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function forEachPromise(items, fn) {
  return items.reduce((promise, item) => promise.then(() => fn(item)), Promise.resolve())
}

function featureFactory(coordinates, name) {

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coordinates || [0, 0],
    },
    properties: {
      id: uuidv4(),
      name: name || 'Unnamed Point',
      bearing: 0,
      distance: 0,
      altitude: 'VFR',
      windDirection: 0,
      windVelocity: 0,
      temperature: 15,
      airSpeed: 100,
      groundSpeed: 0,
      variation: 0,
      deviation: 0,
      legTime: 0,
      weather: {},
    }
  }
}

const DEFAULT_PROPERTIES = {
  bearing: null,
  distance: null,
  altitude: null,
  qnh: null,
  windDirection: null,
  windVelocity: null,
  windCorrectionAngle: null,
  temperature: null,
  airSpeed: null,
  groundSpeed: null,
  variation: null,
  deviation: null,
  legTime: 0,
  fuel: 0,
}

export default {
  template: `
    <div>
      <span>Selecting: {{ selecting }} {{ selectionId }} <button v-show="selecting" @click="selecting = false; selectionId = null;">cancel</button></span>
      <button @click="forceUpdate">Force Update</button>
      <input v-model="properties.startTimeISO" placeholder="Start Time ISO 8601">
      <input v-model="properties.EOBTDate" placeholder="EOBT Date">
      <input v-model="properties.EOBTTime" placeholder="EOBT Time">
      <input v-model.number="properties.fuel" placeholder="Fuel Gallons">
      <button @click="clearData">Clear</button>
      <input v-model.number="allVariation" placeholder="All Variation">
      <button @click="setAllVariation">Set All Variation</button>
      <input v-model.number="allAirSpeed" placeholder="All Airspeed">
      <button @click="setAllAirSpeed">Set All Air Speed</button>
      <button @click="selecting = true">Insert</button>
      
      <p>
      Start Time: {{ startTime.toISOString() }}<br>
      Total Distance: {{ totalDistance.toFixed(2) }} nm<br>
      Total Flying Time: {{ totalFlyingTime.toFixed(0) }}<br>
      Avg Ground Speed: {{ averageGroundSpeed.toFixed(2) }}</p>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th title="Coordinates">Coord</th>
<!--            <th title="Latitude">Lat</th>-->
<!--            <th title="Longitude">Lng</th>-->
            <th title="QNH">QNH</th>
            <th title="Altitude">Alt</th>
            <th title="Outside Air Temperature">Temp</th>
            <th title="Wind Direction (Degrees)">Wind D</th>
            <th title="Wind Velocity (Knots)">Wind V</th>
            <th title="Variation (West +)">Var</th>
            <th title="Bearing">Brg</th>
            <th title="Wind Correction Angle">WCA</th>
            <th>Heading</th>
            <th title="Distance (Nautical Miles)">Distance</th>
            <th title="Air Speed (Knots)">Air Sp</th>
            <th title="Ground Speed (Knots)">Gnd Sp</th>
            <th title="Leg Start Time">Leg Time</th>
            <th title="Leg Duration (minutes)">Leg Dur</th>
            <th title="Total Duration (minutes)">Total Dur</th>
            <th title="Estimated Time">ETA</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="feature in features">
            <td><input v-model="feature.properties.name"></td>
            <td>{{ feature.geometry.coordinates | humanizeCoordinates }} </td>
<!--            <td>{{ feature.geometry.coordinates[1] | humanizeCoordinate }}</td>-->
<!--            <td>{{ feature.geometry.coordinates[0] | humanizeCoordinate }}</td>-->
<!--            <td><input v-model.number="feature.geometry.coordinates[1]"></td>-->
<!--            <td><input v-model.number="feature.geometry.coordinates[0]"></td>-->
            <td>{{ feature.properties.weather && feature.properties.weather.pressure ? feature.properties.weather.pressure.values[0].toFixed(0) : ''}}</td>
            <td><input v-model="feature.properties.altitude" style="max-width: 6em"></td>
            <td>{{ feature.properties.weather && feature.properties.weather.temp ? feature.properties.weather.temp.celsius.toFixed(0) : '' }}</td>
<!--            <td><input v-model.number="feature.properties.temperature" style="max-width: 3em"></td>-->
<!--            <td><input v-model.number="feature.properties.windDirection" type="number" min="0" max="359" step="1" style="max-width: 3em"></td>-->
<!--            <td><input v-model.number="feature.properties.windVelocity" style="max-width: 3em"></td>-->
            <td>{{ feature.properties.weather && feature.properties.weather.wind ? feature.properties.weather.wind.direction : '' }}</td>
            <td>{{ feature.properties.weather && feature.properties.weather.wind ? feature.properties.weather.wind.speedKnots.toFixed(0) : '' }}</td>
            <td><input v-model.number="feature.properties.variation" style="max-width: 3em"></td>
            <td>{{ feature.properties.bearing.toFixed(0) }}</td>
            <td>{{ feature.properties.windCorrectionAngle ? feature.properties.windCorrectionAngle.toFixed(1) : ''}}</td>
            <td>{{ feature.properties.heading ? feature.properties.heading.toFixed(0) : '' }}</td>
            <td>{{ feature.properties.distance.toFixed(2) }}</td>
            <td><input v-model.number="feature.properties.airSpeed" style="max-width: 3em"></td>
            <td>{{ feature.properties.groundSpeed ? feature.properties.groundSpeed.toFixed(0) : '' }}</td>
            <td>{{ feature.properties.timestamp }}</td>
            <td>{{ feature.properties.legTime ? feature.properties.legTime.toFixed(0) : ''}}</td>
            <td>{{ feature.properties.totalTime ? feature.properties.totalTime.toFixed(0) : '' }}</td>
            <td>{{ feature.properties.ETA }}</td>
            <td style="padding-left: 1rem">
              <div style="display: flex">
                <button @click="moveFeature(feature)">move</button>
                <button @click="deleteFeature(feature)">delete</button>
                <button @click="insertAfter(feature)">insert below</button>
                <button @click="getWeather(feature)">get weather</button>
              </div>
            </td>
            
          </tr>
        </tbody>
      </table>
     
      <pre>
        {{ JSON.stringify(geoJSON, null, 2) }}
      </pre>
    </div> `,
  data() {
    return {
      features: [],

      allVariation: null,
      allAirSpeed: null,
      selecting: false, // true if selecting a point on the map
      selectionId: null,
      properties: {
        startTimeISO: (new Date()).toISOString(),
        EOBTDate: '',
        EOBTTime: '',
        fuel: null,
      }

    }
  },
  methods: {
    clearData() {
      if (confirm("Delete data?")) {
        this.features = []
        this.properties = {}
      }
    },
    setAllVariation() {
      this.features.forEach(f => {
        f.properties.variation = this.allVariation
      })
    },
    setAllAirSpeed() {
      this.features.forEach(f => {
        f.properties.airSpeed = this.allAirSpeed
      })
      this.$forceUpdate()
    },
    forceUpdate() {
      this.$forceUpdate()
    },
    insertAfter(feature) {
      const ix = this.features.findIndex(f => f.properties.id === feature.properties.id)
      const newFeature = featureFactory()
      this.features.splice(ix + 1, 0, newFeature)
      this.selecting = true
      this.selectionId = newFeature.properties.id
    },
    deleteFeature(feature) {
      const ix = this.features.findIndex(f => f.properties.id === feature.properties.id)
      this.features.splice(ix, 1)
    },
    moveFeature(feature) {
      this.selecting = true
      this.selectionId = feature.properties.id
    },
    getWeather(feature) {

      const ix = this.features.findIndex(f => f.properties.id === feature.properties.id)

      feature.properties.weather = feature.properties.weather || {}

      const layers = [
        'wind',
        'pressure',
        'temp',
      ]

      forEachPromise(layers, layer => {
        return new Promise((resolve, reject) => {

          window.getWeatherSingle(layer,
            feature.geometry.coordinates[1],
            feature.geometry.coordinates[0],
            feature.properties.timestamp
          ).then(data => {

            feature.properties.weather[data.overlay] = data
            resolve()
          })

        })
      }).then(() => {
        Vue.set(this.features, ix, feature)
      })


    }
  },
  filters: {
    humanizeCoordinates(lngLat) {

      const lat = lngLat[1]
      const lng = lngLat[0]

      const NS = lat < 0 ? 'S' : 'N'
      const EW = lng < 0 ? 'W' : 'E'

      const absLat = Math.abs(lat)
      const absLng = Math.abs(lng)

      const latFloor = Math.floor(absLat)
      const lngFloor = Math.floor(absLng)


      const latPadding = latFloor < 10 ? '0' : ''
      const latMinutes = Math.round((absLat - latFloor) * 60)
      const latMinutesPadding = latMinutes < 10 ? '0' : ''
      const latStr = `${latPadding}${latFloor}${latMinutesPadding}${latMinutes}${NS}`

      const lngPadding = lngFloor < 10 ? '00' : lngFloor < 100 ? '0' : ''
      const lngMinutes = Math.round((absLng - lngFloor) * 60)
      const lngMinutesPadding = lngMinutes < 10 ? '0' : ''
      const lngStr = `${lngPadding}${lngFloor}${lngMinutesPadding}${lngMinutes}${EW}`

      return `${latStr}\xa0${lngStr}` // non-breaking space (160)
    }
  },
  computed: {
    startTime() {
      try {
        return new Date(this.properties.startTimeISO)
      } catch {
        return new Date()
      }
    },
    totalDistance() {
      return this.normalizedFeatures.reduce((acc, p) => acc + p.properties.distance || 0, 0)
    },
    totalFlyingTime() {
      return this.normalizedFeatures.reduce((acc, p) => acc + p.properties.legTime || 0, 0)
    },
    averageGroundSpeed() {
      return this.totalDistance / this.totalFlyingTime * 60
    },
    FPRoute() {

    },
    points() {
      return this.features.filter(f => f.geometry.type === "Point")
    },
    normalizedFeatures() {

      return this.features.map((f, ix) => {

        const prevETA = (ix === 0 ? this.properties.EOBTTime : this.features[ix - 1].properties.ETA) || '0000'

        if (ix < this.features.length - 1) {
          const p1 = f.geometry.coordinates
          const p2 = this.features[ix + 1].geometry.coordinates
          f.properties.bearing = turf.bearing(p1, p2, {final: true})
          f.properties.distance = turf.distance(p1, p2, {units: 'nauticalmiles'}) // / 1.852001
          const windCorrection = wind(f.properties.bearing, f.properties.airSpeed || 0, f.properties.windDirection || 0, f.properties.windVelocity || 0)
          f.properties.windCorrectionAngle = windCorrection.windCorrectionAngle
          f.properties.groundSpeed = windCorrection.groundSpeed
          const heading = f.properties.bearing + f.properties.variation + f.properties.windCorrectionAngle
          f.properties.heading = heading >= 360 ? heading - 360 : heading
          f.properties.legTime = f.properties.groundSpeed ? 60 * f.properties.distance / f.properties.groundSpeed : 0
          const prevTime = ix === 0 ? 0 : this.features[ix - 1].properties.totalTime
          f.properties.totalTime = prevTime + f.properties.legTime
          f.properties.timestamp = (+this.startTime) + (f.properties.totalTime * 60 * 1000)
        }

        f.properties.ETA = minutesToTime(timeToMinutes(prevETA) + f.properties.legTime)

        const rv = JSON.parse(JSON.stringify(f))
        rv.properties = Object.assign({}, DEFAULT_PROPERTIES, rv.properties)
        return rv
      })

    },
    legs() {
      const legs = []
      this.points.forEach((p, ix) => {
        if (ix === this.points.length - 1) return
        const next = this.points[ix + 1]
        const p1 = p.geometry.coordinates
        const p2 = next.geometry.coordinates

        legs.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [p1, p2],
            properties: {}
          },
        })
      })
      return legs
    },
    geoJSON() {

      const defaultProperties = {
        name: "Flight Planning"
      }

      const properties = Object.assign({}, defaultProperties, this.properties)

      return {
        type: "FeatureCollection",
        properties: properties,
        features: this.normalizedFeatures.concat(this.legs)
      }

    }
  },
  created() {

    this.features = JSON.parse(localStorage.getItem('features') || '[]')
    this.properties = JSON.parse(localStorage.getItem('properties') || '{}')
    this.$bus.$on('mapDraw', (e) => {

      if (e.type === "draw:created" && e.layerType === "marker") {
        const geo = e.layer.toGeoJSON()
        const newFeature = featureFactory(geo.geometry.coordinates)
        this.features.push(newFeature)
      }
    })

    this.$bus.$on('mapClick', (e) => {

      if (this.selecting && this.selectionId) {
        const ix = this.features.findIndex(f => f.properties.id === this.selectionId)
        if (ix < 0) return
        const feature = this.features[ix]
        feature.geometry.coordinates = [e.latlng.lng, e.latlng.lat]
        this.features.splice(ix, 1, feature)
        this.selecting = false
        this.selectionId = null
      }

      if (this.selecting && !this.selectionId) {
        const newFeature = featureFactory([e.latlng.lng, e.latlng.lat])
        this.features.push(newFeature)
        this.selecting = false
      }


    })

    this.$bus.$on('airport:select', payload => {

      const airport = window.airports.find(ap => ap.id === payload.value)
      if (!airport) return
      const coords = [airport.longitude_deg, airport.latitude_deg]
      const validIdent = airport.ident && airport.ident.substr(0, 3) !== 'ZA-'
      const newFeature = featureFactory(coords, validIdent ? airport.ident : airport.name)
      this.features.push(newFeature)
    })

  }
  ,
  watch: {
    features: {
      handler: function (val, old) {
        if (!val) return
        localStorage.setItem('features', JSON.stringify(val))
        this.$bus.$emit('geo', this.geoJSON)
      },
      deep: true
    },
    properties: {
      handler: function (val, old) {
        if (!val) return
        localStorage.setItem('properties', JSON.stringify(val))
      },
      deep: true
    }
  }
}