function drawTreemap(data) {
    
    let hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a,b) => b.value - a.value);

    // summation of values of children
    // depth, height
    //parent
    console.log(hierarchy);

    let treemapFn = d3.treemap()
        .size([size.w, size.h])
        .tile(d3.treemapBinary)
        // .tile(d3.treemapDice)
        .padding(1)
        .round(true);

    let treemap = treemapFn(hierarchy);


    // x0, x1, y0, y1
    // width = x1-x0
    // height = y1-y0

    console.log(treemap);
    console.log(treemap.leaves());

    let domain = treemap.children.map(d => d.data.name);
    console.log(domain);

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(domain);

  
  
  

    // need the groups to orient the label
    let leafG = containerG.selectAll('g.leaf-node')
        .data(treemap.leaves())
        .join('g')
        .classed('leaf-node', true)
        .attr('transform', d=> `translate(${d.x0}, ${d.y0})`)
        .attr('fill-opacity', 0.7)
        .style('cursor', d => d.depth <= 1 ? 'auto' : 'pointer')
        .on('mouseenter', hover)
        .on('mouseout', hoverEnd)
        .on('click', (event) => clicked(event,data));

    leafG.selectAll('rect')
        .data(d => [d])
        .join('rect')
    // leafG.append('rect')
        .attr("width", d => {
            return d.x1 - d.x0;
        })
        .attr("height", d => {
            return d.y1 - d.y0;
        })
        .attr('fill',leafNode => {
            let node = leafNode;
            while (node.depth > 1) {
                node = node.parent;
            }
            // node -> depth 1
            // console.log('node',node);
            return colorScale(node.data.name)
        })


    leafG.selectAll('text')
        .data(d => [d])
        .join('text')
    // leafG.append('text')
        .attr('x', 4)
        .attr('y', '1.1em')
        .text(d => d.data.readableName);


}

function hover(event) {

    // console.log(event.currentTarget);
    let dataEle = d3.select(event.currentTarget)
        .datum();

    console.log(dataEle);

    let y = dataEle;
    while (y.depth > 1) {
        y = y.parent;
    }

    // y is the parent of the element hovered on
    // x is each node's parent
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
        });

}

function hoverEnd(event) {

    d3.selectAll('g.leaf-node')
        .attr('fill-opacity', 0.7);

}

function clicked(event, data) {

    let d = d3.select(event.currentTarget).datum();
    // console.log(d);
    if (d.depth <= 1) return;

    let x = d;
    while(x.depth > 1) {
        x = x.parent;
    }

    dispatch.call('updateData', this, x.data.name, data);

}

// function firstLevelParent(ele) {
//     let x = ele
// }