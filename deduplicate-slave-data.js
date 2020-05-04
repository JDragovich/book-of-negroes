const fs = require('fs')

const slaveData = JSON.parse(fs.readFileSync('slave-data.json', 'utf8'))
const locationData = JSON.parse(fs.readFileSync('locations.json', 'utf8'))

let indexesToRemove = []

for(let i=0; i < slaveData.length; i++){
  for(let j=0; j < slaveData.length; j++){
    if(i !== j && slaveData[i].rawEntry === slaveData[j].rawEntry && !indexesToRemove.some(e => slaveData[i].index === e || slaveData[j].index === e)){
      console.log('found duplicate entry ', slaveData[i].name, ': ', slaveData[i].index, ', ', slaveData[j].index )
      indexesToRemove.push(slaveData[j].index)
    }
  }
}

const cleanedData = slaveData.filter(e => !indexesToRemove.some(d => d === e.index))
cleanedData.forEach(d => {
  if(locationData.cities[d.city]){
    d.normalizedLocation = {
      city: d.city,
      colony: d.city === 'Philadelphia' ? 'Pennsylvania' : d.colony
    }
  } else{
    d.normalizedLocation = {
      city: null,
      colony: null
    }
  }
})
const cleanedLocationData = Object.keys(locationData.cities).reduce((c, d) => {
  c[d] = locationData.cities[d]
  c[d].indexes = c[d].indexes.filter(e => !indexesToRemove.some(d => d === e.index))
  c[d].indexes.forEach(e => {
    const slave = cleanedData.find(s => s.index === e)
    if(!slave) return
    if(slave.city !== d){
      slave.normalizedLocation = {
        city: d,
        colony: c[d].colony
      }
    }
    else {
      slave.normalizedLocation = {
        city: slave.city,
        colony: slave.colony
      }
    }
  })
  return c
}, {})

console.log(cleanedData.length)

fs.writeFileSync('cleaned-slave-data.json', JSON.stringify(cleanedData, null, 4), 'utf8')
fs.writeFileSync('cleaned-location-data.json', JSON.stringify({cities:cleanedLocationData}, null, 4), 'utf8')
