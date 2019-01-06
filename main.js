var fs = require('fs');
var through = require('through2');
var parseOSM = require('osm-pbf-parser');
 
var osm = parseOSM();
var latLonArr = []
fs.createReadStream(process.argv[2])
  .pipe(osm)
  .pipe(through.obj(function (items, enc, next) {
      items.forEach(function (item) {
          latLonArr.push(item.lat + ', ' + item.lon)
          //console.log(item.lat + ', ' +  item.lon);
      });
      next();
      console.log(latLonArr)
  }))
;
