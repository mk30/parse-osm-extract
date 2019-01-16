var fs = require('fs')
var through = require('through2')
var parseOSM = require('osm-pbf-parser')
var earcut = require('earcut')
 
var osm = parseOSM()
var mesh = { positions: [], cells: [] }
var nodes = {}

fs.createReadStream(process.argv[2])
  .pipe(osm)
  .pipe(through.obj(write, end))

function write (items, enc, next) {
  items.forEach(function (item) {
    if (item.type === 'node') {
      nodes[item.id] = [item.lon, item.lat]
    }
    if (item.type === 'way') {
      var polygon = []
      var n = mesh.positions.length
      item.refs.forEach(function (itemRef) {
        polygon.push(nodes[itemRef][0], nodes[itemRef][1])
        mesh.positions.push(nodes[itemRef])
      })
      var cells = earcut(polygon)
      cells.forEach(function (cell) {
        mesh.cells.push(cell + n)
      })
    }
  })
  next()
}

function end (next) {
  console.log(JSON.stringify(mesh))
}
