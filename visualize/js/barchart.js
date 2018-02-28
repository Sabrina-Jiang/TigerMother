(function () {
  var activity_descriptions = {
    "Educational Activities": "Educational Activities",
    "Working and related activities": "Working and related activities",
    "Eating and Drinking": "Eating and Drinking",
    "Leisure and Sports": "Leisure and Sports",
    "Grooming": "Grooming",
    "Traveling": "Traveling",
    "Other": "Other",
    "Sleeping":"Sleeping",
  }
  var racelist = {
    "1": { "name": "White", color: "#6b8ef7", count: 0 },
    "2": { "name": "Black", color: "#dd5a62", count: 0 },
    "3": { "name": "American Indian", color: "#fe7805", count: 0 },
    "4": { "name": "Asian", color: "#fedc5b", count: 0 },
  };
  var agegrps = {
    "3": "High School",
    "5": "College",
  };


// Data storage for easier access
  var pctsByKey = []
  var curr_pcts

// User settings
  var USER_RACE = '1'
  var USER_EDU = '3'
  var USER_KEY = USER_RACE + USER_EDU


  var margin = {top: 30, right: 20, bottom: 30, left: 10},
    width = parseInt(d3.select('#chart').style('width'), 10),
    width = width - margin.left - margin.right,
    height = 600, // Will change.
    barHeight = 25,
    spacing = 10,
    percent = d3.format(),
    index,
    bars;


  var x = d3.scale.linear()
    .range([0, width])
//    .domain([0, 50])

  var y = d3.scale.ordinal()


  var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(percent)
    .outerTickSize(0)
//    .innerTickSize(8)
//    .tickPadding(5);

// create the chart
  var svg = d3.select('#chart').append('svg')
    .style('width', (width + margin.left + margin.right) + 'px')
    .append('g')
    .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

  d3.csv('data/histogram.csv', typeAndSet, function (error, data) {
    if (error) throw error

    x.domain([0, width]);
    // Updater
    d3.selectAll('#education .button').on('click.bar', function () {
      USER_EDU = d3.select(this).attr('data-val')
      d3.select('#education .current').classed('current', false)
      d3.select(this).classed('current', true)

      USER_KEY = USER_RACE + USER_EDU;
      sex_changed = true;
      update()
    })

    d3.selectAll('#race .button').on('click.bar', function () {
      USER_RACE = d3.select(this).attr('data-val')
      d3.select('#race .current').classed('current', false)
      d3.select(this).classed('current', true)

      USER_KEY = USER_RACE + USER_EDU;
      sex_changed = true;
      update()
    })


//    x.domain([0, 200])
    y.domain(d3.range(pctsByKey[USER_KEY].length))
      .rangeBands([0, pctsByKey[USER_KEY].length * barHeight])

    index = d3.range(pctsByKey[USER_KEY].length)

    // set height based on data
    height = y.rangeExtent()[1]
    d3.select(svg.node().parentNode)
      .style('height', (height + margin.top + margin.bottom) + 'px')

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis.orient('bottom'))

    bars = svg.selectAll('.bar')
      .data(pctsByKey[USER_KEY])
      .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', function(d, i) { return 'translate(0,'  + y(i) + ')'; });

    bars.append('rect')
      .attr('class', 'background')
      .attr('height', y.rangeBand())
      .attr('width', width);

    bars.append('rect')
      .attr('class', 'percent')
      .attr('height', y.rangeBand())
      .attr('width', function(d) { return d["duration"]; })

    bars.append('text')
      .text(function(d) { return activity_descriptions[d.activities]; })
      .attr('class', 'name')
      .attr('y', y.rangeBand() - 8)
      .attr('x', spacing);

    update()
  }) // @end d3.tsv()

  function update () {

    // Update bar lengths
    svg.selectAll('.bar')
      .data(pctsByKey[USER_KEY])
      .select(".percent")
      .transition()
      .duration(250)
      .attr('width', function(d) { return d["duration"]; })
      .attr('fill', function (d) { return racelist[USER_RACE].color
      })
      .each("end", updateOrder);
  }

  function updateOrder() {

    curr_pcts = pctsByKey[USER_KEY].map(function(d) { return d["duration"] });

    index.sort(function(a, b) { return curr_pcts[b] - curr_pcts[a]; });

    y.domain(index);

    bars.transition()
      .duration(250)
      .delay(function(d, i) { return i * 30 })
      .attr('transform', function(d, i) { return 'translate(0,'  + y(i) + ')'; });

  }


  d3.select(window).on('resize', resize);

  function resize() {
    // update width
    width = parseInt(d3.select('#chart').style('width'), 10);
    width = width - margin.left - margin.right;

    // resize the chart
    x.range([0, width]);
    d3.select(svg.node().parentNode)
      .style('height', (y.rangeExtent()[1] + margin.top + margin.bottom) + 'px')
      .style('width', (width + margin.left + margin.right) + 'px');

    svg.selectAll('rect.background')
      .attr('width', width);

    svg.selectAll('rect.percent')
      .attr('width', function(d) { return d["duration"]; });

    // update axes
    svg.select('.x.axis.top').call(xAxis.orient('top'));
    svg.select('.x.axis.bottom').call(xAxis.orient('bottom'));
  }

  function typeAndSet(d) {
    for (property in d) {
      if (property == "duration") {
        d[property] = d[property]
      }
    }
    var key = d.race + d.enroll;
    if (!pctsByKey.hasOwnProperty(key)) {
      pctsByKey[key] = [];
    }
    pctsByKey[key].push(d);

    return d;
    console.log(pctsByKey)
  }

})()