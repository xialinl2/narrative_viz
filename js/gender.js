
function drawDot(data, index, s){
  if (s !== playing){
    return false
  }

  color = data[index].Sex == "M" ? 'ROYALBLUE' : 'VIOLET';

  var newDot = svgGen.selectAll('dot')
    .data([data[index]]).enter()
    .append("circle")
    .attr("class", "dot") 
    .attr("cx", function(d){return GxScale(d.Year)+(GxScale.bandwidth()/2)})
    .attr("cy", function(d){return GyScale(d.Count)})
    .attr("r", 3)
    .style("fill", color)
    .style("stroke","#fff")
    .style('opacity', 0.75)

    .on('mouseover', function (d) {
      tooltipGen
        .html('<span>'
          + d.Year + " - " + hosts[index].City
          + "<br>Male: " + maleTrend[index].Count
          + "<br>Female: " + femaleTrend[index].Count +'</span>')
        .style('left',  + 46 + 'px')
        .style('top',  + 40 + 'px')
        .transition()
        .style('opacity', 1);

        guideLine
          .attr("x1", GxScale(data[index].Year)+(GxScale.bandwidth()/2))
          .attr("x2", GxScale(data[index].Year)+(GxScale.bandwidth()/2))
          .transition()
          .style("opacity", 0.15);

        d3
          .select("#c"+d.Year)
          .attr('fill', 'red')

    })
    .on('mouseout', function (d) {
      tooltipGen
        .transition()
        .style('opacity', 0)
      guideLine
        .transition()
        .style("opacity", 0);
      d3
        .select("#c"+d.Year)
        .attr('fill', 'steelblue')
    })

    .transition()
      .attr('r', '10px')
    .transition()
      .attr('r', '4px')
    ;
}

function drawLine(data, start, end, history, s){
  if (s !== playing){
    return false
  }

  var getline = d3.line()
  .x(function(d) { return GxScale(d.Year)+(GxScale.bandwidth()/2); })
  .y(function(d) { return GyScale(d.Count); });
  
  color = data[start].Sex == "M" ? 'ROYALBLUE' : 'VIOLET';

  var newLine = svgGen
    .append("path")
    .attr("class", "line")
    .attr("d", function(){ return getline([data[start],data[start+1]]) })
    .style("fill", "none")
    .style("stroke", "gray")
    .style("stroke-width", 2)
    .style('opacity', 0.2)

    if (history == false) {
      newLine
        .style("stroke", color)
        .style("stroke-width", 2)
        .style('opacity', 0.8)

        .transition()
        .duration(2000)
        .attrTween('stroke-dasharray', function() {
          var len = this.getTotalLength();
          return function(t) {
              return (d3.interpolate('0,' + len, len + ',0'))(t)
          };
        })
        .on('end', function(){
          start++;
          drawDot(data,start,s);
          drawBarTree(start,s);
          if (start<end) {
            drawLine(data, start, end, history, s);
          }
        })
    } else {
      start++;
      if (start<end) {
        drawLine(data, start, end, history, s);
      }
    }
}