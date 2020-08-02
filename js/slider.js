// add SVG
var svgslider = d3.select("#slider")
  .append("svg")
  .attr("width", 850)
  .attr("height", 80);
    
// Scale
var sliderxScale = d3.scaleBand()
  .domain(times)
  .range([0, 800]);

// Customize invert function
sliderxScale.invert = (function(){
  var domain = sliderxScale.domain()
  var range = sliderxScale.range()
  var scale = d3.scaleQuantize().domain(range).range(domain)
  return function(x){
    return scale(x)
  }
})()

// add slider group
var slider = svgslider.append("g")
  .attr("class", "slider")
  .attr("transform", "translate(30,40)");

// Add slider track components
// track
slider.append("line")
  .attr("class", "track")
  .attr("x1", sliderxScale.range()[0])
  .attr("x2", sliderxScale.range()[1])

// track-inset
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  .attr("class", "track-inset") // 修改line 2的class

// track-overlay
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  .attr("class", "track-overlay")

// Add ticks
var ticks = slider.insert("g", ".track-overlay")
  .attr("class", "ticks")
  .attr("transform", "translate(0,15)")
  .call(d3.axisBottom(sliderxScale)
  .tickValues([1896,1936,1948,1980,1984,2000,2004,2016])
  .tickSizeInner(-8)
  .tickSizeOuter(0));

// Add label
var label = slider.append("text")  
  .attr("class", "label")
  .attr("text-anchor", "middle")
  .text(times[0])
  .attr("transform", "translate(15,-15)");

// Add handle
var handle = slider.insert("line", ".track-overlay")
  .attr("class", "handle")
  .attr("transform", "translate(15,0)")
  .attr("x1", 0)
  .attr("y1", -5)
  .attr("x2", 0)
  .attr("y2", 5);

// update
function updateSlider(year,s,duration = 2000) {
  if (s !== playing){
    return false
  }
  handle
    .transition()
    .duration(duration)
    .attr("x1", sliderxScale(year))
    .attr("x2", sliderxScale(year));
  label
    .transition()
    .duration(duration/2)
    .style('opacity', 0)
    .transition()
    .duration(0)
    .attr("x", sliderxScale(year))
    .transition()
    .duration(duration/2-100)
    .text(year)
    .style('opacity', 1)
    
    ;
    
}