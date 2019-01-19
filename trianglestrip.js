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
    var waycoords = []
    var waynorms = []
    var waynormsdoubled = []
    if (item.type === 'way') {
      waycoords.push(nodes[item.refs[0]])
      item.refs.forEach(function (itemRef) {
        waycoords.push(nodes[itemRef])
      })
      waycoords.push(nodes[item.refs[item.refs.length - 1]])
      waynorms = getNormals(waycoords)
      waynorms.forEach(function (norm) {
        waynormsdoubled.push(norm[0])
        waynormsdoubled.push([-1*norm[0][0], -1*norm[0][1]])
      })
      waynormsdoubled.push(waynormsdoubled[waynormsdoubled.length - 1])
      console.log(waynormsdoubled)
    }
  })
  next()
}

function end (next) {
/*
  prenormals = getNormals(prepositions)
  prepositions.forEach(function (pos) {
    mesh.positions.push(pos)
  })
  prenormals.forEach(function (norm) {
    mesh.normals.push(norm[0])
    mesh.normals.push([-1*norm[0][0], -1*norm[0][1]])
  })
*/
  //console.log(JSON.stringify(mesh))
}
