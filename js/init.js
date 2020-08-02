var times = [1896,1900,1904,1908,1912,1920,1924,1928,1932,1936,1948,1952,1956,1960,1964,1968,1972,1976,1980,1984,1988,1992,1996,2000,2004,2008,2012,2016];


//// Read in data & prepare for using
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson") // World shape
  .defer(d3.csv, "https://raw.githubusercontent.com/xialinl2/narrative_viz/master/SO_host_city.csv") // Position of circles
  .defer(d3.csv, "https://raw.githubusercontent.com/xialinl2/narrative_viz/master/genderTrend.csv") // Gender Trend
  .defer(d3.json, "https://raw.githubusercontent.com/xialinl2/narrative_viz/master/olympicregions.json") // Regions
  .defer(d3.csv, 'https://raw.githubusercontent.com/xialinl2/narrative_viz/master/NationTrend.csv') // Nationality
  .await(ready);

function ready(error, dataGeo, hosts, gender, regions, nation){
  if (error) { console.log(error); }

  this.hosts = hosts;
  this.list = regions.olympicregions;
  var sumstat = d3.nest() 
    .key(function(d) { return d.Sex;})
    .entries(gender);
  this.maleTrend = sumstat[0].values;
  this.femaleTrend = sumstat[1].values;

  this.nation=nation;
  var nested_data = d3.nest() 
    .key(function () { return "root"; })
    .key(function(d) { return d.Year;})
    .key(function(d) { return d.Continent;})
    .entries(nation);
  var root = d3.hierarchy(nested_data[0], function (d) { return d.values; })
    .sum(function (d) { return d.value; });
    root.sum(function (d) { return d.value });
    root.sort(function(a, b) { return a.data.key - b.data.key; });
    root.each(function (d) { d.index = d.parent ? d.parent.children.indexOf(d) : 0 });
  this.childData = root.children;

  drawMap(dataGeo);
  drawGenderAxis(maleTrend);
  drawNationAxis(childData);
}



// For Map
var tooltipMap = d3.select("#MapCav")
  .append('div')
  .attr('class', 'tooltip');

var svgMap = d3.select("#MapCav")
  .append('svg')
  .attr('class', 'map')
  .attr('height', 400)
  .attr('width', 730);

var hosts, list,
  projectionMap = d3.geoMercator().center([65, 0]).scale(118).rotate([0,0]);

function drawMap(data){
  this.svgMap.append("g")
    .selectAll("path")
    .data(data.features)
    .enter().append("path")

    .attr("class", "country")
    .attr("d", d3.geoPath().projection(projectionMap))
    .attr("id", function(d){
      if (d.properties.name == "England" || d.properties.name == "Ireland"){
        var region = "UK";
      } else if (d.properties.name == "United Republic of Tanzania") {
        var region = "Tanzania"
      } else if (d.properties.name == "Republic of Serbia") {
        var region = "Serbia"
      } else {
        var region = d.properties.name;
      }      
      return region
    })
    .attr('fill', 'lightgray');
  data = null;
}


// For Gender line chart
var margin = {top: 5, right: 10, bottom: 25, left: 35},
  width = 350 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom,
  GxScale, GyScale;

var svgGen = d3.select("#genTrend")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var guideLine = svgGen.append("line")
  .attr("class", "guideLine")
  .attr("x1", 5)
  .attr("y1", 0)
  .attr("x2", 5)
  .attr("y2", height)
  .style("stroke", "gray")
  .style("stroke-width", 10)
  .style("opacity", 0);

var tooltipGen = d3.select("#genTrend")
  .append('div')
  .attr('class', 'tooltip');

var d2 = 0;

function drawGenderAxis(data){
  this.GxScale = d3.scaleBand()
    .domain(times)
    .range([0, width]);

  GxScale.invert = (function(){
      var domain = GxScale.domain()
      var range = GxScale.range()
      var scale = d3.scaleQuantize().domain(range).range(domain)
  
      return function(x){
          return scale(x)
      }
  })()

  this.GyScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.Count; })])
    .range([height, 0]);

  this.svgGen.append("g")
    .attr("class", "y_axis")
    .call(d3.axisLeft(GyScale)
      .ticks(5)
      .tickSizeInner(-width)
      .tickSizeOuter(0)
  );

  this.svgGen.append("g")
    .attr("class", "x_axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(GxScale)
      .tickValues([1896,1948,1984,2004,2016])
      .tickSizeOuter(0)
      .tickSizeInner(-height)
    );
}


// For Nationality Tree-bar chart
var orderedContinents = ['Europe', 'Americas', 'Asia', 'Oceania', 'Africa', 'Individual Olympic Athletes']

var color = d3.scaleOrdinal()
  .domain(orderedContinents)
  .range(['#5DADE2', '#EC7063', '#F4D03F', '#58D68D', '#5D6D7E', '#AF7AC5'])

var tooltipNat = d3.select("#treeMap")
  .append('div')
  .attr('class', 'tooltip');

// append the svg object to the body of the page
var svgNat = d3.select("#treeMap")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform","translate(" + margin.left + "," + margin.top + ")");

var NxScale, NyScale;

function drawNationAxis(data){
  this.NxScale = d3.scaleBand()
                        .domain(this.times)
                        .range([0, width])
                        .padding(0.15);

  this.NyScale = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) {
      return d.value+500 })
    ])
    .range([0,height]);

  var xAxis = d3.axisBottom()
    .scale(NxScale)
    .tickValues([1896,1948,1984,2004,2016])
    .tickSizeOuter(0)
    .tickSizeInner(-height)

  var yAxis = d3.axisLeft()
    .scale(NyScale.copy().range([height, 0]))
    .tickSizeInner(-width)
    .tickSizeOuter(0)
  
  this.svgNat.append('g')
    .attr('class', 'x_axis')
    .attr('id', 'NxAxis')
    .attr('transform', "translate(0," + height + ")")
    .call(xAxis)

  this.svgNat.append('g')
    .attr('class', 'y_axis')
    .attr('id', 'NyAxis')
    .call(yAxis)
}