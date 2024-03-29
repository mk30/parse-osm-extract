var fs = require('fs')
var through = require('through2')
var parseOSM = require('osm-pbf-parser')
var getNormals = require('polyline-normals')
var features = require('./lib/features.json')
 
var osm = parseOSM()
var mesh = { positions: [], normals: [], attributes: [] }
var nodes = {}

fs.createReadStream(process.argv[2])
  .pipe(osm)
  .pipe(through.obj(write, end))


function write (items, enc, next) {
  items.forEach(function (item) {
    if (item.type === 'node') {
      nodes[item.id] = [item.lon, item.lat]
    }
    if (item.type === 'node' && Object.keys(item.tags).length > 0) {
      Object.keys(item.tags).forEach(function (key) {
        if (features[key + '.' + Object.values(item.tags)]) {
          console.log(features[key + '.' + Object.values(item.tags)])
        }
        else if (features[key + '.other']) console.log(features[key + '.other'])
      })
    }
    var allpositions = []
    var waynorms = []
    var waypositions = []
    var waynormsdoubled = []
    if (item.type === 'way') {
      allpositions.push(nodes[item.refs[0]])
      item.refs.forEach(function (itemRef) {
        waypositions.push(nodes[itemRef])
        allpositions.push(nodes[itemRef])
        allpositions.push(nodes[itemRef])
      })
      allpositions.push(nodes[item.refs[item.refs.length - 1]])
      waynorms = getNormals(waypositions)
      waynormsdoubled.push(waynorms[0][0])
      waynorms.forEach(function (norm) {
        waynormsdoubled.push(norm[0])
        waynormsdoubled.push([-1*norm[0][0], -1*norm[0][1]])
      })
      waynormsdoubled.push(waynormsdoubled[waynormsdoubled.length - 1])
      waynormsdoubled.forEach(function (dnorm) {
        mesh.normals.push(dnorm)
      })
      allpositions.forEach(function (pos) {
        mesh.positions.push(pos)
      })
    }
  })
  next()
}

function end (next) {
  console.log(JSON.stringify(mesh))
}
