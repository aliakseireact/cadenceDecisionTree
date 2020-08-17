import * as workflow from '../data/unknown-large.json';
import { nodeMap } from './eventFunctionMap.js';


var nodeTemplate = Handlebars.compile($('#node-template').html());

var g = new dagreD3.graphlib.Graph()
  .setGraph({ align: 'DR' })
  .setDefaultEdgeLabel(function () { return {}; }); //Neccessary to display arrows between nodes

//Create a map to store parent and child eventID's as key value pairs.
// The first workflow node will never have a parent - we set it to 0 in the map
let parentMap = new Map();
parentMap.set(1, 0)

//Helper function to check if map contains a value
let mapContainsValue = (map, val) => [...map.values()].includes(val)

buildTree()

function buildTree() {
  //Create nodes and set their parents in map
  workflow.forEach(function (node) {
    g.setNode(node.eventId, {
      label: nodeTemplate({ label: node.eventType }),
      labelType: "html",
      id: node.eventId,
      class: [node.type],
      hovertext: node.eventId
    });
    setParent(node)
  });

  //Set edges between the nodes
  workflow.forEach(function (node) {
    if (node.eventId === 1) return;
    setEdge(node)
  })
}

function setEdge(node) {
  let parentId = parentMap.get(node.eventId)
  let nodeId = node.eventId
  //Edge case when a childworkflow returns a signal, it has two parents.
  if (node.eventType === 'ChildWorkflowExecutionCompleted') {
    g.setEdge(nodeId - 1, nodeId)
  }
  //Edge case when an event has no children, but should be linked back to the workflow
  if (!mapContainsValue(parentMap, nodeId) && nodeId != parentMap.size) {
    g.setEdge(nodeId, nodeId + 1)
  }
  g.setEdge(parentId, nodeId)
}

function setParent(node) {
  // Skip first workflow node
  if (node.eventId === 1) return;
  let parentId = findParentId(node)
  if (parentId) parentMap.set(node.eventId, parentId)
  //No parent ID => linked event to the one before it.
  else parentMap.set(node.eventId, node.eventId - 1)
}
function findParentId(node) {
  let parentId;
  //Get the object which contains 'EventAttributes' - has information about parent node
  let nodeKeys = Object.keys(node)
  let eventAttrKey = nodeKeys.filter(cls => cls.includes('EventAttributes'))
  let eventAttrObj = node[eventAttrKey]
  //Get an array of all  keys to object which contains 'EventID' (can be several)
  let eventKeys = Object.keys(eventAttrObj)
  let relativeKeys = eventKeys.filter(cls => cls.includes('EventId'))

  if (relativeKeys.length != 0) {
    parentId = relativeKeys.reduce((max, p) =>
      eventAttrObj[p] > max ? eventAttrObj[p]
        : max, eventAttrObj[relativeKeys[0]]);
  }
  return parentId
}
g.nodes().forEach(function (v) {
  var node = g.node(v);
  // Round the corners of the nodes
  node.rx = node.ry = 5;
});

// Set up an SVG group so that we can translate the final graph.
var svg = d3.select("svg"),
  inner = svg.select("g"),
  innerInner = inner.selectAll(".node");
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