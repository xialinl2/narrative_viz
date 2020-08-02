function drawCity(data, index, s){
  if (s !== playing){
    return false
  }

  var tooltip = data[index].Year + " - " + data[index].City
  + '<br>' + data[index].Regions + ' regions took part in this Game';

  this.svgMap.selectAll('city')
    .data([data[index]]).enter()
    .append('circle')
    .attr('class', 'city')
    .attr('id',function(d){return "c"+d.Year})
    .attr('cx', function(d) { return projectionMap([d.Longitude, d.Latitude])[0]; })
    .attr('cy', function(d) { return projectionMap([d.Longitude, d.Latitude])[1]; })
    .style('opacity', 1)
    .style('z-index', 1)
    .attr('fill', 'steelblue')
    .attr('r', '2px')

    .on('mouseover', function (d) {
      d3.select(this)
        .attr('fill','red')
      tooltipMap
        .html('<span>' + tooltip + '</span>')
        .style('left', projectionMap([d.Longitude, d.Latitude])[0] + 20 + 'px')
        .style('top', projectionMap([d.Longitude, d.Latitude])[1] + 10 + 'px')
        .transition()
        .style('opacity', 1);
      })
    .on('mouseout', function () {
      d3.select(this)
        .attr('fill','steelblue')
      tooltipMap
        .transition()
        .style('opacity', 0)
        .transition()
        .duration(0)
        .style('left', 0)
        .style('top', 0)
      })
    
    .transition()
    .attr('r', '15px')
    .style('opacity', 0.5)
    .transition()
    .attr('r', '5px')
    .style('opacity', 0.8);

}

function getArc(origin, destination){
  var originPos = projectionMap([origin.Longitude, origin.Latitude]);
  var destinationPos = projectionMap([destination.Longitude, destination.Latitude]);

  var dx = destinationPos[0] - originPos[0];
  var dy = destinationPos[1] - originPos[1];
  var dr = Math.sqrt(dx * dx + dy * dy);
  var spath = destinationPos[0] < originPos[0] ? ' 0 0,0 ' : ' 0 0,1 ';
  return 'M' + originPos[0] + ',' + originPos[1] + 'A' + dr + ',' + dr + spath + destinationPos[0] + ',' + destinationPos[1];
}

function drawArc(start, end, history, s){
  if (s !== playing){
    return false
  }

  var arc = getArc(hosts[start],hosts[start+1]);

  var newarc = svgMap
    .append('path')
    .attr('class', 'arc')
    .attr('d', arc)
    .style('z-index', 0)
    .style('stroke', 'gray')
    .style('stroke-width', 2)
    .style('stroke-opacity', 0.2)
    .style('fill', 'none');

  if (history == false) {
    updateSlider(times[start+1],s);
    newarc
      .style('stroke', 'steelblue')
      .style('stroke-width', 2)
      .style('stroke-opacity', 0.8)

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
        var currlist = list[start].Regions;
        drawCity(hosts,start,s);
        drawRegion(currlist, s);
        if (start<end) {
          drawArc(start, end, history, s);
        }
      })
  } else {
    start++;
    var currlist = list[start].Regions;
    drawRegion(currlist, s);
    if (start<end) {
      drawArc(start, end, history, s);
    }
  }
}

function drawRegion(data, s){
  if (s !== playing){
    return false
  }
  regions = d3.selectAll('.country').each(function () {
    if (data.indexOf(d3.select(this).attr("id")) >= 0) {
      d3.select(this)
        .transition()
        .attr('fill', 'lightsteelblue');
    } else {
      d3.select(this)
        .transition()
        .attr('fill', 'lightgray');
    }
 });
}
