import * as workflow from '../data/parent_failed.json';

var g = new dagreD3.graphlib.Graph()
  .setGraph({ align: 'DR' })
  .setDefaultEdgeLabel(function () { return {}; }); //Neccessary to display arrows between nodes

//Create nodes
workflow.forEach(function (node) {
  g.setNode(node.eventId, {
    label: node.eventType,
    shape: "rect",
    class: [node.type],
    hovertext: node.eventId
  });
});

//Create a map to store parent and child eventID's as key value pairs.
// The first workflow node will never have a parent - we set it to 0 in the map
let parentMap = new Map();
parentMap.set(1, 0)


function findParent(node) {
  let parentId;
  //Get the object which contains 'EventAttributes' - has information about parent node
  let nodeKeys = Object.keys(node)
  let attributesKey = nodeKeys.filter(cls => cls.includes('EventAttributes'))
  //Get an array of all  keys to object which contains 'EventID' (can be several)
  let eventKeys = Object.keys(node[attributesKey])
  let relativeKeys = eventKeys.filter(cls => cls.includes('EventId'))

  if (relativeKeys.length != 0) {
    parentId = relativeKeys.reduce((max, p) =>
      node[attributesKey][p] > max ? node[attributesKey][p] : max, node[attributesKey][relativeKeys[0]]);
  }

  return parentId
}


function setParent(node) {

}

workflow.forEach(function (node) {
  // Skip first workflow node
  if (node.eventId === 1) return;

  //Edge case when a childworkflow returns a signal, it has two parents.
  if (node.eventType === 'ChildWorkflowExecutionCompleted') {
    g.setEdge(node.eventId - 1, node.eventId)
  }

  let parentId = findParent(node)

  if (parentId) {
    g.setEdge(parentId, node.eventId)
    parentMap.set(node.eventId, parentId)
  }
  //If we haven't found a parent ID, the event should be linked to the event before it.
  else {
    g.setEdge(node.eventId - 1, node.eventId)
    parentMap.set(node.eventId, node.eventId - 1)
  }
})

//Helper function to check if map contains a value
const mapContainsChild = (map, val) => [...map.values()].includes(val)

//Set edges
workflow.forEach(function (node) {


  if (!mapContainsChild(parentMap, node.eventId) && node.eventId != parentMap.size) {
    g.setEdge(node.eventId, node.eventId + 1)
  }
})

g.nodes().forEach(function (v) {
  var node = g.node(v);
  // Round the corners of the nodes
  node.rx = node.ry = 5;
});

// Set up an SVG group so that we can translate the final graph.
var svg = d3.select("svg"),
  inner = svg.select("g");
// Create the renderer
var render = new dagreD3.render();

// Set up zoom
var zoom = d3.zoom().on("zoom", function () {
  inner.attr("transform", d3.event.transform);
  inner.attr("transform", d3.event.transform);
});
svg.call(zoom);

// Run the renderer. This is what draws the final graph.
render(inner, g);

//Select all nodes and add click event
//ALso trying out mouseover and mouseout
inner.selectAll('g.node')
  //To access the node hovertext
  .attr("data-hovertext", function (v) {
    return g.node(v).hovertext
  })
  .on("click", function () {
    //Show tooltip
    d3.select("#tooltip").classed("hidden", false);
  })
  .on('mousemove', function (d) {
    //Update coordinates for the tooltip
    d3.select("#tooltip")
      .style("left", (event.pageX - 10) + "px")
      .style("top", (event.pageY + 10) + "px")
      .select("#info")
      .text(this.dataset.hovertext);
  })
  .on("mouseout", function () {
    d3.select("#tooltip").classed("hidden", true);
  });

//svg.attr("height", g.graph().height + 50);