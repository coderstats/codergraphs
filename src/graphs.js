function containerWidth(selector) {
  return parseInt($(selector).width())
}
function containerHeight(selector) {
  return parseInt($(selector).height())
}

function truncate(s, max) {
    if (s.length > max) {
        s = s.substring(0, max-1) + '.';
    }
    return s;
}

function barHorizontal(selector, data, options) {
    if ('undefined' === typeof options || null === options) {
        options = {barCount: data.length};
    }
    if (options.hasOwnProperty('barCount')) {
        data = data.slice(0, options.barCount);
    }

    var maxval = d3.max(data, function(d) { return d.value });
    var barHeight = 30,
        barPadding = 8,
        labelPadding = 6,
        barHeightOffset = barHeight - barPadding,
        valueOffset = 10,
        // responsive dimensions
        chartWidth = containerWidth(selector),
        labelWidth = chartWidth / 4,
        valuelWidth = chartWidth / 7.5,
        barWidth = chartWidth - labelWidth,
        chartHeight = barHeight * options.barCount,
        // scales & text
        wscale = d3.scale.linear().domain([0, maxval]).range(['0px', barWidth - valuelWidth + 'px'])
        title = function(d) {return d.key + ': ' + d.value},
        formatValue = d3.format(',d');

    var bar = d3.select(selector);
    bar.selectAll('svg').remove();
    var svg = bar.append('svg')
        .attr('class', 'bar')
        .attr('width', chartWidth)
        .attr('height', chartHeight - barPadding);

    // no data
    if (data.length == 0) {
        svg.append('text')
            .attr('class', 'no-data')
            .attr('x', chartWidth/2)
            .attr('y', chartHeight/2)
            .attr('text-anchor', 'middle')
            .text('No Data');
        return;
    }

    // add actual bars
    svg.selectAll('rect.fillblue')
        .data(data)
        .enter().append('rect')
        .attr('class', 'fillblue')
        .attr('x', labelWidth)
        .attr('y', function(d, i) {return i * barHeight})
        .attr('width', function(d) {return isNaN(d.value) ? 0 : wscale(d.value)})
        .attr('height', barHeight - barPadding)
        .append('title').text(title);

    // add lablels
    var labels = svg.selectAll('text').data(data).enter();
    labels.append('text')
        .attr('class', 'barlabel')
        .attr('x', 0)
        .attr('y', function(d, i) {return i * barHeight - labelPadding + barHeightOffset})
        .attr('text-anchor', 'start')
        .text(function(d) {return truncate(d.key, 16)});

    // add values
    labels.append('text')
        .attr('class', 'barvalue')
        .attr('x', chartWidth - valuelWidth + valueOffset)
        .attr('y', function(d, i) {return i * barHeight - labelPadding + barHeightOffset})
        .attr('text-anchor', 'start')
        .text(function(d) {return formatValue(d.value)});

    // add click handler if appropriate options are set
    if (options.hasOwnProperty('clickBase')) {
        svg.selectAll('text.barlabel')
            .attr('class', 'barlabel link')
            .on('click', function(d) {window.open(options.clickBase + d.key)})
            .append('title')
                .text(function(d) { return 'Click to open ' + options.clickBase + d.key});
    }
}

function pie(selector, data) {
    var chartWidth = containerWidth(selector),
        chartHeight = chartWidth,
        radius = Math.min(chartWidth, chartHeight) / 2,
        color = d3.scale.ordinal().range(['#1F78B4', '#b2df8a'])
        arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    var svg = d3.select(selector).append('svg')
        .attr('width', chartWidth)
        .attr('height', chartHeight)
        .append('g')
        .attr('transform', 'translate(' + chartWidth / 2 + ',' + chartHeight / 2 + ')');

    var g = svg.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc');

      g.append('path')
          .attr('d', arc)
          .style('fill', function(d) { return color(d.value); });

      g.append('text')
          .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
          .attr('dy', '.35em')
          .style('text-anchor', 'middle')
          .text(function(d) { return d.data.key + ': ' + d.value; });
}