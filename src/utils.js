export function wind(bearing, airspeed, windDirection, windVelocity) {

  windDirection = Math.PI * windDirection / 180
  bearing = Math.PI * bearing / 180

  const windCorrectionAngle = Math.asin(windVelocity * Math.sin(windDirection - bearing) / airspeed)
  const groundSpeed = Math.sqrt(Math.pow(airspeed, 2) + Math.pow(windVelocity, 2) - 2 * airspeed * windVelocity * Math.cos(bearing - windDirection + windCorrectionAngle))

  return {
    windCorrectionAngle: windCorrectionAngle * 180 / Math.PI,
    groundSpeed: groundSpeed,
  }

}

export function timeToMinutes(timeString) {
  if (!timeString.match(/\d{4}/)) return 0
  return parseInt(timeString.substr(0, 2)) * 60 + parseInt(timeString.substr(2, 2))
}

export function minutesToTime(minutes) {
  if (isNaN(minutes)) return ''
  minutes = Math.round(minutes)
  const hours = Math.floor(minutes/60)
  const mod = minutes % 60
  const hString = hours < 10 ? "0" + hours : hours.toString()
  const mString = mod < 10 ? "0" + mod : mod.toString()
  return hString + mString
}