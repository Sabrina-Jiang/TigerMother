var clockController = undefined
var timerFunction = undefined

var USER_SPEED = 'medium'
var pause = false

var margin = {top: 110, right: 50, bottom: 50, left: 145},
  // 1050, 500
  width = rootWidth - margin.left - margin.right,
  height = 550 - margin.top - margin.bottom,
  padding = 3, // separation between nodes
  radius = 3.8,
  damper = 0.9

// var width = 780,
//     height = 800,
// 	padding = 1,
// 	maxRadius = 3;
// 	// color = d3.scale.category10();

var sched_objs = [],
  curr_minute = 0

// Simplified
var act_codes = {
  'w': {'short': 'HW', 'desc': 'Homework'},
  'c': {'short': 'Class', 'desc': 'Take Class'},
  'o': {'short': 'Other', 'desc': 'Other Activities'},
  's': {'short': 'Sleeping', 'desc': 'Sleeping'},
}

// Short versions.
var ethics_names = {
  '1': {'name': 'White', color: '#6b8ef7', count: 0},
  '2': {'name': 'Black', color: '#dd5a62', count: 0},
  '3': {'name': 'American Indian', color: '#fe7805', count: 0},
  '4': {'name': 'Asian', color: '#fedc5b', count: 0},
}

var speeds = {'slow': 1000, 'medium': 180, 'fast': 50}

var time_notes = [
  {
    'start_minute': 1,
    'stop_minute': 30,
    'note': 'This is a simulated day of students in the United States, for various race (all stimulated people are single race).'
  },
  {
    'start_minute': 40,
    'stop_minute': 90,
    'note': 'Each dot represents a person doing different activities. Colored, non-gray means a person is doing homework or having class.'
  },
  {
    'start_minute': 220,
    'stop_minute': 270,
    'note': 'Working day has begun, students going to have class or do their homework.'
  },
  {
    'start_minute': 300,
    'stop_minute': 440,
    'note': 'People of doing homework and having class significantly raised and turn to stable'
  },
  {'start_minute': 450, 'stop_minute': 530, 'note': 'It\'s time for lunch.'},
  {
    'start_minute': 540,
    'stop_minute': 710,
    'note': 'Back to work. But you can see people take breaks. (Dots turn gray at workplace.)'
  },
  {'start_minute': 730, 'stop_minute': 860, 'note': 'Calling it a day. People finished with their classes.'},
  {'start_minute': 900, 'stop_minute': 1100, 'note': 'A day ends.'},
  {'start_minute': 1110, 'stop_minute': 1380, 'note': 'Most people are sleeping or getting ready for bed.'},
  {'start_minute': 1390, 'stop_minute': 1430, 'note': 'Another day is on the way...'},
]
var notes_index = 0

var x = d3.scale.ordinal()
  .rangePoints([0, width])
var xAxis = d3.svg.axis()
  .scale(x)
  .tickFormat(function (d) {
    return ethics_names[d]['name']
  })
  .orient('top')
// var xGrid = d3.svg.axis()
// 	.scale(x)
//     .orient("bottom")
//     .innerTickSize(-(height+margin.top));
// .tickPadding(10);

var y = d3.scale.ordinal()
  .domain(Object.keys(act_codes))
  .rangePoints([0, height/1.5])
var yAxis = d3.svg.axis()
  .scale(y)
  .tickSize(40)
  .tickFormat(function (d) {
    console.log(Object.keys(act_codes))
    return act_codes[d]['desc']
  })
  .orient('left')

// Start the SVG
var svg = d3.select('#chart').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// Load data and let's do it.
d3.csv('data/network_refine.csv', function (error, data) {

  //
  // Axes
  //
  x.domain(d3.map(data, function (d) { return d.grp }).keys())
  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(-70,-10)')
    .call(yAxis)
    .selectAll('.tick text')
    .call(wrap, 80)
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,-100)')
    .call(xAxis)
    .selectAll('.tick text')
    .call(wrap, x.rangeBand())

  //
  // Counters
  //
  var counter = svg.selectAll('.counter')
    .data(Object.keys(ethics_names))
    .enter().append('g')
    .attr('class', 'counter')
    .attr('transform', function (d) { return 'translate(' + x(d) + ',-60)' })
    .append('text')
    .attr('text-anchor', 'middle')
    .text(function (d, i) {
      if (i == 0) {
        return readablePercent(ethics_names[d].count) + ' HomeWork'
      } else {
        return readablePercent(ethics_names[d].count)
      }
    })

  //
  // Store data
  //
  data.forEach(function (d) {
    var day_array = d.day.split(',')
    var activities = []
    for (var i = 0; i < day_array.length; i++) {
      // Duration
      if (i % 2 == 1) {
        activities.push({
          'grp': d.grp,
          'act': day_array[i - 1].substring(0, 1),
          'where': day_array[i - 1].substring(0, 1),
          'duration': +day_array[i]
        })
      }
    }
    sched_objs.push(activities)
    // console.log(activities)
  })

  // A node for each person's schedule
  var nodes = sched_objs.map(function (o, i) {
    var init = o[0]
    var init_x = x(init.grp) + Math.random()
    var init_y = y(init.where) + Math.random()
    if (init.act == 'w') {
      colorByOcc(init.grp)
      ethics_names[init.grp].count += 1
    } else {
      var col = '#cccccc'
    }
    return {
      grp: init.grp,
      act: init.act,
      where: init.where,
      radius: radius,
      x: init_x,
      y: init_y,
      color: col,
      moves: 0,
      next_move_time: init.duration,
      sched: o,
    }
  })

  var force = d3.layout.force()
    .nodes(nodes)
    .size([width, height])
    .gravity(0)
    .charge(0)
    .friction(.9)
    .on('tick', tick)
    .start()

  var circle = svg.selectAll('circle')
    .data(nodes)
    .enter().append('circle')
    .attr('r', function (d) { return d.radius })
    .style('fill', function (d) { return d.color })

  // Update nodes based on activity and duration
  function timer () {
    d3.range(nodes.length).map(function (i) {
      var curr_node = nodes[i],
        curr_moves = curr_node.moves

      // Time to go to next activity
      if (curr_node.next_move_time == curr_minute) {
        if (curr_node.moves == curr_node.sched.length - 1) {
          curr_moves = 0
        } else {
          curr_moves += 1
        }

        // Keep track of working and not working
        if (curr_node.act == 'w' && curr_node.sched[curr_moves].act != 'w') {
          ethics_names[curr_node.grp].count -= 1
        } else if (curr_node.act != 'w' && curr_node.sched[curr_moves].act == 'w') {
          ethics_names[curr_node.grp].count += 1
        }

        // Move on to next activity
        curr_node.act = curr_node.sched[curr_moves].act
        curr_node.where = curr_node.sched[curr_moves].where

        // Add to new activity count
        // act_counts[curr_node.act] += 1;

        curr_node.moves = curr_moves
        curr_node.cx = x(curr_node.grp)
        curr_node.cy = y(curr_node.where)

        nodes[i].next_move_time += nodes[i].sched[curr_node.moves].duration
      }

    })

    force.resume()
    curr_minute += 1

    // Update percentages
    svg.selectAll('.counter text')
      .text(function (d, i) {
        if (i == 0) {
          return readablePercent(ethics_names[d].count) + ' HomeWork'
        } else {
          return readablePercent(ethics_names[d].count)
        }
      })

    // Update time
    var true_minute = curr_minute % 1440
    d3.select('#current_time').text(minutesToTime(true_minute))

    // Update notes
    // var true_minute = curr_minute % 1440;
    if (true_minute == time_notes[notes_index].start_minute) {
      d3.select('#note')
        .transition()
        .duration(600)
        .style('color', '#000000')
        .text(time_notes[notes_index].note)
    }

    // Make note disappear at the end.
    else if (true_minute == time_notes[notes_index].stop_minute) {

      d3.select('#note').transition()
        .duration(600)
        .style('color', '#ffffff')

      notes_index += 1
      if (notes_index == time_notes.length) {
        notes_index = 0
      }
    }

    clockController = setTimeout(timer, speeds[USER_SPEED])
  }

  clockController = setTimeout(timer, speeds[USER_SPEED])

  timerFunction = timer

  function tick (e) {
    var k = 0.1 * e.alpha

    // Push nodes toward their designated focus.
    nodes.forEach(function (o, i) {
      var curr_act = o.act

      if (curr_act == 'w' || curr_act == 'c') {
        o.color = colorByOcc(o.grp)
      } else {
        o.color = '#cccccc'
      }

      o.x += (x(o.grp) - o.x) * k * damper
      o.y += (y(o.where) - o.y) * k * damper

    })

    circle
      .each(collide(.5))
      .style('fill', function (d) { return d.color })
      .attr('cx', function (d) { return d.x })
      .attr('cy', function (d) { return d.y })
  }

  // Resolve collisions between nodes.
  function collide (alpha) {
    var quadtree = d3.geom.quadtree(nodes)
    return function (d) {
      var r = d.radius + radius + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r
      quadtree.visit(function (quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.where !== quad.point.where) * padding
          if (l < r) {
            l = (l - r) / l * alpha
            d.x -= x *= l
            d.y -= y *= l
            quad.point.x += x
            quad.point.y += y
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1
      })
    }
  }

  // Speed toggle
  d3.selectAll('.togglebutton')
    .on('click', function () {
      if (d3.select(this).attr('data-val') == 'slow') {
        d3.select('.slow').classed('current', true)
        d3.select('.medium').classed('current', false)
        d3.select('.fast').classed('current', false)
      } else if (d3.select(this).attr('data-val') == 'medium') {
        d3.select('.slow').classed('current', false)
        d3.select('.medium').classed('current', true)
        d3.select('.fast').classed('current', false)
      }
      else {
        d3.select('.slow').classed('current', false)
        d3.select('.medium').classed('current', false)
        d3.select('.fast').classed('current', true)
      }

      USER_SPEED = d3.select(this).attr('data-val')
    })
}) // @end d3.tsv

function colorByOcc (occ) {

  return ethics_names[occ].color
}

function colorByActivity (activity) {

  var color_by_activity = {
    '0': '#e0d400',
    '1': '#1c8af9',
    '2': '#51BC05',
    '3': '#FF7F00',
    '4': '#DB32A4',
    '5': '#00CDF8',
    '6': '#E63B60',
    '7': '#8E5649',
    '8': '#68c99e',
    '9': '#a477c8',
    '10': '#5C76EC',
    '11': '#E773C3',
    '12': '#799fd2',
    '13': '#038a6c',
    '14': '#cc87fa',
    '15': '#ee8e76',
    '16': '#bbbbbb',
  }

  return color_by_activity[activity]

}

function wrap (text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1, // ems
      y = text.attr('y'),
      dy = parseFloat(text.attr('dy')),
      tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em')
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(' '))
      if (tspan.node().getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(' '))
        line = [word]
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word)
      }
    }
  })
}

// Output readable percent based on count.
function readablePercent (n) {

  var pct = 100 * n / 100
  if (pct < 1 && pct > 0) {
    pct = '<1%'
  } else {
    pct = Math.round(pct) + '%'
  }

  return pct
}

// Minutes to time of day. Data is minutes from 4am.
function minutesToTime (m) {
  var minutes = (m + 4 * 60) % 1440
  var hh = Math.floor(minutes / 60)
  var ampm
  if (hh > 12) {
    hh = hh - 12
    ampm = 'pm'
  } else if (hh == 12) {
    ampm = 'pm'
  } else if (hh == 0) {
    hh = 12
    ampm = 'am'
  } else {
    ampm = 'am'
  }
  var mm = minutes % 60
  if (mm < 10) {
    mm = '0' + mm
  }

  return hh + ':' + mm + ampm
}

function pauseButtonDidClick () {
  clearTimeout(clockController)
  $('input#pause').css('display', 'none')
  $('input#play').css('display', 'initial')
}

function playButtonDidClick () {
  clockController = setTimeout(timerFunction, speeds[USER_SPEED])
  $('input#play').css('display', 'none')
  $('input#pause').css('display', 'initial')
}
