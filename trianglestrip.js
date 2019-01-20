var fs = require('fs')
var through = require('through2')
var parseOSM = require('osm-pbf-parser')
var getNormals = require('polyline-normals')
 
var osm = parseOSM()
var mesh = { positions: [], normals: [] }
var nodes = {}
var allpositions = []

fs.createReadStream(process.argv[2])
  .pipe(osm)
  .pipe(through.obj(write, end))

function write (items, enc, next) {
  items.forEach(function (item) {
    if (item.type === 'node') {
      nodes[item.id] = [item.lon, item.lat]
    }
    var waypositions = []
    var waynorms = []
    var waynormsdoubled = []
    if (item.type === 'way') {
      waypositions.push(nodes[item.refs[0]])
      allpositions.push(nodes[item.refs[0]])
      item.refs.forEach(function (itemRef) {
        waypositions.push(nodes[itemRef])
        allpositions.push(nodes[itemRef])
        allpositions.push(nodes[itemRef])
      })
      waypositions.push(nodes[item.refs[item.refs.length - 1]])
      allpositions.push(nodes[item.refs[item.refs.length - 1]])
      waynorms = getNormals(waypositions)
      waynorms.forEach(function (norm) {
        waynormsdoubled.push(norm[0])
        waynormsdoubled.push([-1*norm[0][0], -1*norm[0][1]])
      })
      waynormsdoubled.push(waynormsdoubled[waynormsdoubled.length - 1])
      waynormsdoubled.forEach(function (dnorm) {
        mesh.normals.push(dnorm)
      })
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
  console.log(mesh.normals)
}
