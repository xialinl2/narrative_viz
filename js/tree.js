function drawBarTree(index,s){
  if (s !== playing){
    return false
  }


  var color = d3.scaleOrdinal()
  .domain(orderedContinents)
  .range(['#5DADE2', '#EC7063', '#F4D03F', '#58D68D', '#5D6D7E', '#AF7AC5'])

  
  var yearData = [childData[index]];
  var t = d3.transition()

  var years = svgNat.selectAll('.year')
    .data(yearData , function (d) { return +d.data.key; });

  years = years.enter().append('g')
  .attr('class', 'year')
  .attr('transform', function (d) {
    return 'translate(' + NxScale(+d.data.key) + ',0)'
  })
  .each(function (d) {
    d.children.sort(function (a, b) {
      return orderedContinents.indexOf(b.data.key) -
        orderedContinents.indexOf(a.data.key)
    })
    d.children.forEach(function (d) {
      d.sort(function (a, b) { return b.value - a.value })
    })
    d.treemap = d3.treemap().tile(d3.treemapResquarify).paddingInner(0.1)
    d.treemapRoot = d.copy()
  })
  .merge(years)
  .each(function (d) {
    d.treemap.size([NxScale.bandwidth(), NyScale(d.value)])(d.treemapRoot)
  })

  years
  .on('mouseover', function (d) {
    console.log(d)
    d3
      .select("#c"+d.data.key)
      .attr('fill', 'red')
  })
  .on('mouseout', function (d) {
    d3
      .select("#c"+d.data.key)
      .attr('fill', 'steelblue')
  })
  .transition(t)
    // .delay(function (d, i) { return d.parent.index * 150 + i * 50 })
    .attr('transform', function (d) {
        return 'translate(' + NxScale(+d.data.key) + ',' + (height - NyScale(d.value)) + ')'
    })
  
  var continents = years.selectAll('.continent')
    .data(function (d) { return d.treemapRoot.children },
      function (d) { return d.data.key })
  
  continents = continents.enter().append('g')
    .attr('class','continent')
    .merge(continents)
  
  var countries = continents.selectAll('.country')
    .data(function (d) { return d.children },
      function (d) { return d.data.Country })

  var enterCountries = countries.enter().append('rect')
    .attr('class', 'country')
    .attr('id', function(d){ return d.data.Country})
    .attr('x', function (d) { return d.x0 })
    .attr('width', function (d) {return d.x1 - d.x0 })
    .attr('y', height)
    .attr('height', 0)
    .style('fill', function (d) { return color(d.parent.data.key) })
  
  countries = countries.merge(enterCountries)

  enterCountries
    .on('mouseover', function (d) {
      tooltip = times[index] + " - " + hosts[index].City + "<br>" + d.data.Country + " has " + d.data.value + " atheletes took part";

      svgNat.classed('hover-active', true)
      d3.selectAll('.country').each(function () {
        if (d3.select(this).attr('id') == d.data.Country) {
          d3.select(this)
          .classed('hover', true);
        } else {
          d3.select(this)
          .classed('hover', false);
        }
      })

      tooltipNat
        .html('<span>' + tooltip + '</span>')
        .style('left', '-120px')
        .style('top', '380px')
        .transition()
        .style('opacity', 1);
    })
    .on('mouseout', function () {
      svgNat.classed('hover-active', false)
      countries.classed('hover', false)
      tooltipNat
        .transition()
        .style('opacity', 0)
    })
    .append('title')
    .text(function (d) { return d.data.Country })


  countries
    .transition(t)
    .attr('x', function (d) { return d.x0 })
    .attr('width', function (d) { return d.x1 - d.x0 })
    .attr('y', function (d) { return d.y0 })
    .attr('height', function (d) { return d.y1 - d.y0 })
    
}