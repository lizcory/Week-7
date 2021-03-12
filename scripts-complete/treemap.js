function drawTreemap(data) {

    // Creating a data heirarchy with summed up values
    // so we can size the rectangles according to the calculated values
    let heirarchy = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Creating a treemap layout
    // so we can translate our data into a layout
    let treemap = d3.treemap()
        .tile(d3.treemapSquarify)
        // possible tiling values are
        // d3.treemapSlice, d3.treemapDice, d3.treemapSliceDice
        // d3.treemapSquarify, d3.treemapBinary
        .size([size.w, size.h])
        .padding(1)
        .round(true)
        (heirarchy);

    let domain = treemap.leaves().map(d => {
        let x = d;
        while (x.depth > 1) { x = x.parent; }
        return d.data.name;
    });
    domain = new Set(domain);
    domain = Array.from(domain);

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(domain);

    const leaf = svg.selectAll('g')
        .data(treemap.leaves())
        .join('g')
        .classed('leaf-node', true)
        .attr('transform', d => `translate(${d.x0},${d.y0})`)
        .attr('fill-opacity', 0.7)
        .style('cursor', d => d.depth > 1 ? 'pointer' : 'auto')
        .on('mouseenter', hover)
        .on('mouseout', hoverEnd)
        .on('click', (event, d) => {
            if (d.depth <= 1) return;
            let x = d;
            while(x.depth > 1) {
                x = x.parent;
            }

            dispatch.call('updateData', this, x.data.name, data);
        });

    leaf.selectAll('rect')
        .data(d => [d])
        .join('rect') 
        .attr('fill', (d, i) => {
            let x = d;
            while(x.depth > 1) {
                x = x.parent;
            }
            return colorScale(x.data.name);
        })
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0);

    leaf.selectAll('text')
        .data(d => [d])
        .join('text')
        .selectAll('tspan')
        .data(d => {
            // returning array with 2 objects
            // one with the name
            // second with the value
            // both of these will be used as labels
            return [
                d.data.readableName,
                d3.format(',d')(d.value)
            ];
        })
        .join('tspan') // 2 tspans are added, one for each data element
        .attr('x', 3)
        .attr('y', (d, i, nodes) => `${1.1 + i * 1.1}em`) // placing both labels one below the other
        .attr('fill-opacity', (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .text(d => d);
}

function hover(event) {
    let dataEle = d3.select(event.currentTarget).datum();
    let y = dataEle;
    while(y.depth > 1) {
        y = y.parent;
    }

    d3.selectAll('g.leaf-node')
        .attr('fill-opacity', d => {
            let x = d;
            while(x.depth > 1) {
                x = x.parent;
            }
            if (x.data.name === y.data.name) {
                return 1;
            } else {
                return 0.7;
            }
        })
}

function hoverEnd(event) {
    d3.selectAll('g.leaf-node')
        .attr('fill-opacity', 0.7);
}