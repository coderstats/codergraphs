(function(d3) {

var containerWidth = function(selector) {
        return parseInt(d3.select(selector).style('width'))
    },
    truncate = function(s, max) {
        if (s.length > max) {
            s = s.substring(0, max-1) + '.';
        }
        return s;
    };

d3.graph = {};

d3.graph.bar = function(selector, data, options) {
    var defaults = {
        barHeight: 30,
        barPadding: 8,
        labelRatio: 4,
        labelPadding: 6,
        valueRatio: 7.5,
        valueOffset: 10,
        barCount: data.length
    };
    if ('undefined' !== typeof options && null !== options) {
        for (o in options) defaults[o] = options[o];
    }
    options = defaults;

    var getLink = function(d) {
        return d.link ? d.link : null;
    };

    // responsive dimensions
    var chartWidth = containerWidth(selector),
        labelWidth = chartWidth / options.labelRatio,
        valuelWidth = chartWidth / options.valueRatio,
        barWidth = chartWidth - labelWidth,
        chartHeight = options.barHeight * options.barCount,
        // scales, texts, offsets
        maxVal = d3.max(data, function(d) { return d.value }),
        wscale = d3.scale.linear().domain([0, maxVal]).range(['0px', barWidth - valuelWidth + 'px'])
        title = function(d) {return d.key + ': ' + d.value},
        y = function(d, i) {return i * options.barHeight},
        valueY = function(d, i) {return i * options.barHeight + (options.barHeight/2)},

        // labels
        labelClick = function(d) {
            if (href = getLink(d)) {
                document.location.href = href;
            }
        },
        labelClass = function(d) {
            return getLink(d) ? 'barlabel link' : 'barlabel';
        },
        labelTitle = function(d) {
            var title = d.key,
                href = getLink(d);
            if (href) {
                title = 'Click to open ' + href;
            }
            return title;
        },

        // formats
        formatValue = d3.format(',d'),
        // bar and graph objects
        bar = {
            selector: selector,
            options: options,
            data: data.slice(0, options.barCount)
        },
        graph = d3.select(selector);

    graph.selectAll('svg').remove();
    var svg = graph.append('svg')
        .attr('class', 'bar')
        .attr('width', chartWidth)
        .attr('height', chartHeight - options.barPadding);

    bar.values = function() {
        var values = svg.selectAll('text').data(bar.data).enter();
        values.append('text')
            .attr('class', 'barvalue')
            .attr('x', chartWidth - valuelWidth + options.valueOffset)
            .attr('y', valueY)
            .attr('text-anchor', 'start')
            .text(function(d) {return formatValue(d.value)});
    };

    bar.horizontal = function() {
        svg.selectAll('rect')
            .data(bar.data)
            .enter().append('rect')
            .attr('x', labelWidth)
            .attr('y', function(d, i) {return i * options.barHeight})
            .attr('width', function(d) {return isNaN(d.value) ? 0 : wscale(d.value)})
            .attr('height', options.barHeight - options.barPadding)
            .append('title').text(title);

        var labels = svg.selectAll('text').data(bar.data).enter();
        labels.append('text')
            .attr('class', labelClass)
            .attr('x', 0)
            .attr('y', valueY)
            .attr('text-anchor', 'start')
            .text(function(d) {return truncate(d.key, 16)})
            .on('click', labelClick)
            .append('title')
                .text(labelTitle);

        // FIXME calling bar.values doesn't show values, why?
        labels.append('text')
            .attr('class', 'barvalue')
            .attr('x', chartWidth - valuelWidth + options.valueOffset)
            .attr('y', valueY)
            .attr('text-anchor', 'start')
            .text(function(d) {return formatValue(d.value)});
    };

    bar.horizontalImage = function() {
        svg.selectAll('rect')
            .data(bar.data)
            .enter().append('rect')
            .attr('width', function(d) {return isNaN(d.value) ? 0 : wscale(d.value)})
            .attr('height', options.barHeight - options.barPadding)
            .attr('x', options.imageWidth)
            .attr('y', y)
            .append('title').text(title);

        var labels = svg.selectAll('image').data(bar.data).enter();
        labels.append('svg:image')
            .attr('xlink:href', function(d) { return d.image.src })
            .attr('class', labelClass)
            .attr('width', options.imageWidth - options.barPadding)
            .attr('height', options.barHeight - options.barPadding)
            .attr('x', 0)
            .attr('y', y)
            .on('click', labelClick)
            .append('title')
                .text(labelTitle);

        bar.values();
    };

    // no data
    if (bar.data.length == 0) {
        svg.append('text')
            .attr('class', 'no-data')
            .attr('x', chartWidth/2)
            .attr('y', chartHeight/2)
            .attr('text-anchor', 'middle')
            .text('No Data');
    }

    return bar;
}

d3.graph.pie = function(selector, data) {
    var chartWidth = containerWidth(selector),
        chartHeight = chartWidth,
        radius = Math.min(chartWidth, chartHeight) / 2,
        color = d3.scale.category10().domain(d3.keys(data)),
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
          .style('fill', function(d) { return d.data.color || color(d.data.key); });

    var glabels = d3.select(selector).append('svg')
        .attr('width', chartWidth)
        .attr('height', 50);

    glabels.selectAll('text').data(data).enter()
        .append('text')
            .attr('x', 30)
            .attr('y', function(d, i) {return (1 + i) * 20})
            .style('text-anchor', 'start')
            .text(function(d) { return d.key + ': ' + d.value });

    glabels.selectAll('rect').data(data).enter()
        .append('rect')
            .attr('x', 10)
            .attr('y', function(d, i) {return ((1 + i) * 20) - 10})
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', function(d) { return d.color || color(d.key); });
}

})(d3);