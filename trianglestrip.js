var fs = require('fs')
var through = require('through2')
var parseOSM = require('osm-pbf-parser')
var getNormals = require('polyline-normals')
 
var osm = parseOSM()
var mesh = { positions: [], normals: [] }
var nodes = {}
var prepositions = []
var prenormals = []

fs.createReadStream(process.argv[2])
  .pipe(osm)
  .pipe(through.obj(write, end))

function write (items, enc, next) {
  items.forEach(function (item) {
    if (item.type === 'node') {
      nodes[item.id] = [item.lon, item.lat]
    }
    if (item.type === 'way') {
      item.refs.forEach(function (itemRef) {
        prepositions.push(nodes[itemRef])
      })
    }
  })
  next()
}

function end (next) {
  prenormals = getNormals(prepositions)
  prepositions.forEach(function (pos) {
    mesh.positions.push(pos)
    mesh.positions.push(pos)
  })
  prenormals.forEach(function (norm) {
    mesh.normals.push(norm)
    mesh.normals.push([norm[0], -1*norm[1]])
  })
  console.log(JSON.stringify(mesh))
}
