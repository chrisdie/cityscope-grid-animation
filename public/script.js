
//var cityioserver = "https://cityscope-io-server.glitch.me/hdm-test"
var cityioserver = "http://localhost:3001/hdm-test"

var _griddata = []

$.getJSON("grid.json", function(json) {
  _griddata = json; // this will show the info it in firebug console
});


var _gridCellWidth  = 25;
var _gridCellHeight = 25; 

var _gridRowNum = 20
var _gridColNum = 20

$(document).ready(function () {

  var _gridCanvasWidth  = _gridColNum * _gridCellWidth + 5
  var _gridCanvasHeight = _gridRowNum * _gridCellHeight + 5


  var types = [
    
    {type: "house" , fill : "#fff"},
    {type: "street", fill : "#ccc"},
    {type: "park", fill: "#4c5"}, 
    {type: "river", fill: "#005"}
  ] 

  function gridData() { 
    var data = new Array();
    var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;
    var width = _gridCellWidth;
    var height = _gridCellHeight; 
    var click = 0;

    // iterate for rows	
    for (var row = 0; row < _gridRowNum; row++) {
      data.push( new Array() );

      // iterate for cells/columns inside rows
      for (var column = 0; column < _gridColNum; column++) {
        data[row].push({
          idx: [row,column],
          x: xpos,
          y: ypos,
          width: width,
          height: height,
          click: click,
          type : {...types[2]} // inits every square as park
        })
        // increment the x position. I.e. move it over by 50 (width variable)
        xpos += width;
      }
      // reset the x position after a row is complete
      xpos = 1;
      // increment the y position for the next row. Move it down 50 (height variable)
      ypos += height;	
    }
    return data;
  }

  _griddata = gridData();	
  // I like to log the data to the console for quick debugging
  //console.log(data);

  var grid = d3.select("#grid")
    .append("svg")
    .attr("width","" + _gridCanvasWidth + "px")
    .attr("height","" + _gridCanvasHeight + "px");

  var row = grid.selectAll(".row")
    .data(_griddata)
    .enter().append("g")
    .attr("class", "row");


  var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
  var column = row.selectAll(".square")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("class","square")
    .attr("id",function(d) { return "cell"+d.idx[0]+d.idx[1]})
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("width", function(d) { return d.width; })
    .attr("height", function(d) { return d.height; })
    .style("fill", "#fff")
    .style("stroke", "#222")
    .on("click", function(d) {
         d.click ++; 
      console.log(_griddata[d.idx[0]][d.idx[1]])
       if ((d.click)%types.length == 0 ) { _griddata[d.idx[0]][d.idx[1]].type = {...types[0]}; } 
       if ((d.click)%types.length == 1 ) { _griddata[d.idx[0]][d.idx[1]].type = {...types[1]}; }
       if ((d.click)%types.length == 2 ) { _griddata[d.idx[0]][d.idx[1]].type = {...types[2]}; }
       if ((d.click)%types.length == 3 ) { _griddata[d.idx[0]][d.idx[1]].type = {...types[3]}; }
       
       console.log(_griddata)
       sendData(_griddata) 
       redraw()
       
      });

  function redraw(){
    row.selectAll(".square") 
      .data(function(d) { return d; })
      .style("fill", function(d) { return d.type.fill })
  
  }

  $.postJSON = function(url, data, callback) {
      return $.ajax({
          'type': 'POST', 
          'url': url,
          'contentType': 'application/json',
          'data':data,
          'dataType': 'json',
          'success': callback
      });  
  };

  function transformDataForCityIO(data){
    //console.log(_cityioGridTemplate)
    
    var res = [] 
    
    data.forEach((row) => {
         var col = row.map((square) => {
           var typeIdx = types.findIndex((typ) => typ.type === square.type.type)
           return [typeIdx,0]
        })     
        res.push(...col)
    }) 
    _cityioGridTemplate.grid = res
    return _cityioGridTemplate
  };  
  
 
  function sendData(data){ 
    
    var cityiodata = transformDataForCityIO(data)
    console.log("*** sending data",data)
    $.ajax({
          'type': 'POST',
          'url': "/newdata",
          'crossDomain':true,
          'contentType': 'application/json',
          'data': JSON.stringify(data),
          'dataType': 'json'})
    
    $.ajax({
          'type': 'POST',
          'url': cityioserver,
          'crossDomain':true,
          'contentType': 'application/json',
          'data': JSON.stringify(cityiodata),
          'dataType': 'json'})

  }

  redraw()
  
  
  const socket = io();
  socket.on("connect", () => socket.emit("hello", `Hi there! I am ${window.navigator.userAgent}`));

  socket.on("newdatafromserver", newdata => {
    console.log("***** new data1",newdata)
    // update data
    if (newdata) {
      for (var row = 0; row < _gridRowNum; row++) {
        // iterate for cells/columns inside rows
        for (var column = 0; column < _gridColNum; column++) {
            var typIdx = types.findIndex((typ) => typ.type === newdata[row][column].type.type)
            _griddata[row][column].type = types[typIdx]
          }
        }
      }
      redraw()
      console.log("***** new data1",_griddata)
    });
  
})