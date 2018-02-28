(function () {
  var actmeta = {
    'Educational Activities': {name: 'Educational Activities'},
    'Education with children': {name: 'Education with children'},
  }
  var race = {
    '1': 'White',
    '2': 'Black',
    '3': 'American Indian',
    '4': 'Asian',
  }
  var agegrps = {
    '3': 'High School',
    '5': 'College',
  }
  var hours = ['12am', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12pm', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']

// Data storage for easier access
  var pctsByKey = {}
  var curr_pcts

// User settings
  var USER_RACE = '1'
  var USER_EDU = '3'
  var USER_KEY = USER_RACE + USER_EDU

  var margin = {top: 20, right: 10, bottom: 50, left: 50},
    width = 720 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom
  percent = d3.format('%')

  var bisectAge = d3.bisector(function (d) { return d.bin }).left

  var x = d3.scale.linear()
    .rangeRound([0, width])
    .domain([0, 47])

  var y = d3.scale.linear()
    .range([height, 0])

  var color = d3.scale.category10()

  var yAxis = d3.svg.axis()
    .scale(y)
    .tickFormat(percent)
    .tickSize(width)
    .orient('right')

  var line = d3.svg.line()
    .x(function (d) {return x(d.bin)})
    .y(function (d) { return y(d.value) })

  d3.csv('data/line_chart_all.csv', typeAndSet, function (error, data) {
    if (error) throw error

    y.domain([0, 0.6])

    var bin_fields = d3.range(0, 48).map(d => 'b' + d)
    data.forEach(function (d) {
      var curr_key = d.key
      actmeta[d.activity][curr_key] = bin_fields.map(function (bf, i) {
        return {bin: i, value: d[bf]}
      })
    })

    var activities = d3.keys(actmeta).map(function (d) {
      var curr = actmeta[d]
      curr.act = d
      return curr

    })
//    console.log(activities)

    // Time axis labels
    var hours_label = d3.select('#hours').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', 50)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    hours_label.selectAll('.hour')
      .data(hours)
      .enter().append('text')
      .attr('class', 'hour')
      .text(function (d) { return d })
      .attr('x', function (d, i) { return x(2 * i + .5) })
      .attr('y', '1.0em')
      .attr('text-anchor', 'middle')

    // Updater
    d3.selectAll('#education .button').on('click', function () {
      USER_EDU = d3.select(this).attr('data-val')
      d3.select('#education .current').classed('current', false)
      d3.select(this).classed('current', true)

      USER_KEY = USER_RACE + USER_EDU
      sex_changed = true
      update()
    })

    d3.selectAll('#race .button').on('click', function () {
      USER_RACE = d3.select(this).attr('data-val')
      d3.select('#race .current').classed('current', false)
      d3.select(this).classed('current', true)

      USER_KEY = USER_RACE + USER_EDU
      sex_changed = true
      update()
    })

    // create the chart
    var svg = d3.select('#chart-line').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + [margin.left, margin.top] + ')')

    // y axis
    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('y', height + 30)
      .style('text-anchor', 'start')

    svg.selectAll('.y.axis text').attr('x', -20).attr('dy', -4)

    // Student line
    svg.append('path')
      .attr('class', 'line male')
      .attr('d', function (d) {
//        console.log(line(activities[0][USER_KEY]))
        return line(activities[0][USER_KEY])
      })

    // Parents line
    svg.append('path')
      .attr('class', 'line female')
      .attr('d', function (d) {
//        console.log(line(activities[1][USER_RACE + '0']))
        return line(activities[1][USER_RACE + '0'])
      })

    update()

    function update () {

      svg.select('.male')
        .transition()
        .duration(1000)
        .delay(180)
        .attr('d', function (d) { return line(activities[0][USER_KEY]) })

      svg.select('.female')
        .transition()
        .duration(600)
        .attr('d', function (d) { return line(activities[1][USER_RACE + '0']) })
    }

    // Baseline
    svg.append('g')
      .attr('class', 'baseline')
      .attr('transform', 'translate(0,' + height + ')')
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y2', 0)

    //
    // Show values on mouseover
    //

    // Age marker
    var focusbin = svg.append('g')
      .attr('class', 'focus pin')
      .style('display', 'none')
    focusbin.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', y(0.002))
      .attr('y2', y(.45))
    focusbin.append('text')
      .attr('class', 'binvalue')
      .attr('text-anchor', 'middle')
      .attr('y', height + margin.bottom)

    // Student
    var focuss = svg.append('g')
      .attr('class', 'focus student')
      .style('display', 'none')
    focuss.append('circle')
      .attr('r', 5)
    focuss.append('text')
      .attr('x', 9)
      .attr('dy', '.35em')

    // Parent
    var focusp = svg.append('g')
      .attr('class', 'focus parent')
      .style('display', 'none')
    focusp.append('circle')
      .attr('r', 5)
    focusp.append('text')
      .attr('x', 9)
      .attr('dy', '.35em')

    // Events
    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', function () {
        focusp.style('display', null)
        focuss.style('display', null)
        focusbin.style('display', null)
      })
      .on('mouseout', function () {
        focusp.style('display', 'none')
        focuss.style('display', 'none')
        focusbin.style('display', 'none')
      })
      .on('mousemove', mousemove)

    function mousemove () {

      // Student
      var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectAge(activities[0][USER_KEY], x0, 1),
        d0 = activities[0][USER_KEY][i - 1],
        d1 = activities[0][USER_KEY][i],
        d = x0 - d0.bin > d1.bin - x0 ? d1 : d0

      focuss.attr('transform', 'translate(' + x(d.bin) + ',' + y(d.value) + ')')
      focuss.select('text').text('Student, ' + percent(d.value))

      // Parents
      var i_f = bisectAge(activities[1][USER_RACE + '0'], x0, 1),
        d0_f = activities[1][USER_RACE + '0'][i_f - 1],
        d1_f = activities[1][USER_RACE + '0'][i_f],
        d_f = x0 - d0_f.age > d1_f.age - x0 ? d1_f : d0_f
      focusp.attr('transform', 'translate(' + x(d_f.bin) + ',' + y(d_f.value) + ')')
      focusp.select('text').text('Parents, ' + percent(d_f.value))

      // Time indicator
      focusbin.attr('transform', 'translate(' + x(d.bin) + ',0)')
//      focusbin.select('text.binvalue')
////        .attr('y', height + xAxis.tickPadding() + 16)
//        .text(function () {
//          if (d.bin == 47) {
//            return ">" + d.bin;
//          } else {
//            return d.bin;
//          }
//        })

      // Adjust label horizontal positions.
      if (x0 > 47) {
        focuss.select('text').attr('x', -10).attr('text-anchor', 'end')
        focusp.select('text').attr('x', -10).attr('text-anchor', 'end')
      } else {
        focuss.select('text').attr('x', 10).attr('text-anchor', 'beginning')
        focusp.select('text').attr('x', 10).attr('text-anchor', 'beginning')
      }

    }

  }) // @end d3.tsv()

  function typeAndSet (d) {
    d['key'] = []
    d3.keys(d).map(function (key) {
      if (key != 'race' & key != 'enroll' && key != 'activity') {
        d[key] = +d[key]
        d['key'] = d.race + d.enroll
      }
    })

//console.log(d)
    return d
  }
})()