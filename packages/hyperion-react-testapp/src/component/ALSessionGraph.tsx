/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */
import * as React from "react";
import * as AutoLogging from "@hyperion/hyperion-autologging/src/AutoLogging";
import { ALSurfaceMutationEventData } from "@hyperion/hyperion-autologging/src/ALSurfaceMutationPublisher";
import { ALNetworkRequestEvent, ALNetworkResponseEvent } from "@hyperion/hyperion-autologging/src/ALNetworkPublisher";
import { ALUIEventBubbleData, ALUIEventCaptureData, ALUIEventData } from "@hyperion/hyperion-autologging/src/ALUIEventPublisher";
import { ALFlowletEventData } from "@hyperion/hyperion-autologging/src/ALFlowletPublisher";
import { AdsALHeartbeatEventData } from "@hyperion/hyperion-autologging/src/ALHeartbeat";
import Cytoscape from 'cytoscape';
import type cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import klay from 'cytoscape-klay';
import elk from 'cytoscape-elk';
import dagre from 'cytoscape-dagre';
import cola from 'cytoscape-cola';


const LAYOUT = {name: 'elk'}; // {name: 'elk | klay' | 'dagre' | 'cola'}

const ELK_CONFIG = {
  randomize: false, // use random node positions at beginning of layout
  nodeDimensionsIncludeLabels: true, // Boolean which changes whether label dimensions are included when calculating node dimensions
  // TODO: this pans back out when enabled,  we may want to make this configurable
  fit: true, // Whether to fit
  padding: 20, // Padding on fit
  animate: true, // Whether to transition the node positions
  animateFilter: function( node: any, i: any ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: undefined, // Easing of animation if enabled
  transform: function( node: any, pos: any ){ return pos; }, // A function that applies a transform to the final node position
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  nodeLayoutOptions: undefined, // Per-node options function
  elk: {
    // All options are available at http://www.eclipse.org/elk/reference.html
    //
    // 'org.eclipse.' can be dropped from the identifier. The subsequent identifier has to be used as property key in quotes.
    // E.g. for 'org.eclipse.elk.direction' use:
    // 'elk.direction'
    //
    // Enums use the name of the enum as string e.g. instead of Direction.DOWN use:
    // 'elk.direction': 'DOWN'
    //
    // The main field to set is `algorithm`, which controls which particular layout algorithm is used.
    // Example (downwards layered layout):
    'algorithm': 'layered',
    'elk.direction': 'RIGHT',
  },
  priority: function( edge: any ){ return null; }, // Edges with a non-nil value are skipped when geedy edge cycle breaking is enabled
};

const KLAY_CONFIG  = {
  randomize: false, // use random node positions at beginning of layout
  nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
  fit: false, // Whether to fit
  padding: 20, // Padding on fit
  animate: true, // Whether to transition the node positions
  animateFilter: function( node: any, i: any ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // Duration of animation in ms if enabled
  animationEasing: undefined, // Easing of animation if enabled
  transform: function( node: any, pos: any ){ return pos; }, // A function that applies a transform to the final node position
  ready: undefined, // Callback on layoutready
  stop: undefined, // Callback on layoutstop
  klay: {
    // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
    addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
    aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
    borderSpacing: 20, // Minimal amount of space to be left to the border
    compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
    crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
    /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
    INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
    /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
    INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
    direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
    /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
    edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
    edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
    feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
    fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
    /* NONE Chooses the smallest layout from the four possible candidates.
    LEFTUP Chooses the left-up candidate from the four possible candidates.
    RIGHTUP Chooses the right-up candidate from the four possible candidates.
    LEFTDOWN Chooses the left-down candidate from the four possible candidates.
    RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
    BALANCED Creates a balanced layout from the four possible candidates. */
    inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
    layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
    linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
    mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
    mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
    nodeLayering:'NETWORK_SIMPLEX', // Strategy for node layering.
    /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
    LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
    INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
    nodePlacement:'BRANDES_KOEPF', // Strategy for Node Placement
    /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
    LINEAR_SEGMENTS Computes a balanced placement.
    INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
    SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
    randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
    routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
    separateConnectedComponents: true, // Whether each connected component should be processed separately
    spacing: 20, // Overall setting for the minimal amount of space to be left between objects
    thoroughness: 7 // How much effort should be spent to produce a nice layout..
  },
  priority: function( edge: any ){ return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
};

const DAGRE_CONFIG = {
  // dagre algo options, uses default value on undefined
  nodeSep: undefined, // the separation between adjacent nodes in the same rank
  edgeSep: undefined, // the separation between adjacent edges in the same rank
  rankSep: undefined, // the separation between each rank in the layout
  rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
  align: undefined,  // alignment for rank nodes. Can be 'UL', 'UR', 'DL', or 'DR', where U = up, D = down, L = left, and R = right
  acyclicer: undefined, // If set to 'greedy', uses a greedy heuristic for finding a feedback arc set for a graph.
                        // A feedback arc set is a set of edges that can be removed to make a graph acyclic.
  ranker: undefined, // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
  minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
  edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

  // general layout options
  fit: true, // whether to fit to viewport
  padding: 30, // fit padding
  spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
  animate: true, // whether to transition the node positions
  animateFilter: function( node, i ){ return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  transform: function( node, pos ){ return pos; }, // a function that applies a transform to the final node position
  ready: function(){}, // on layoutready
  sort: undefined, // a sorting function to order the nodes and edges; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
                   // because cytoscape dagre creates a directed graph, and directed graphs use the node order as a tie breaker when
                   // defining the topology of a graph, this sort function can help ensure the correct order of the nodes/edges.
                   // this feature is most useful when adding and removing the same nodes and edges multiple times in a graph.
  stop: function(){} // on layoutstop
};

const COLA_CONFIG = {
  animate: true, // whether to show the layout as it's running
  refresh: 1, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node

  // layout event callbacks
  ready: function(){}, // on layoutready
  stop: function(){}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
  nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
  flow: { axis: 'x', minSeparation: 30 }, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
  centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

  // different methods of specifying edge length
  // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
  edgeLength: undefined, // sets edge length directly in simulation
  edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
  edgeJaccardLength: undefined, // jaccard edge length in simulation

  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
};

let CONFIG: typeof KLAY_CONFIG |
  typeof ELK_CONFIG |
  typeof DAGRE_CONFIG |
  typeof COLA_CONFIG |
  null = null;
if (LAYOUT.name === 'klay') {
  console.log('[PS] using klay');
  Cytoscape.use(klay);
  CONFIG = KLAY_CONFIG;
} else if(LAYOUT.name === 'elk') {
  console.log('[PS] using elk');
  Cytoscape.use(elk);
  CONFIG = ELK_CONFIG;
} else if(LAYOUT.name === 'dagre') {
  console.log('[PS] using dagre');
  Cytoscape.use(dagre);
  CONFIG = DAGRE_CONFIG;
}
else if(LAYOUT.name === 'cola') {
  console.log('[PS] using cola');
  Cytoscape.use(cola);
  CONFIG = COLA_CONFIG;
}



type EventBody = {event: string} & (
  ALFlowletEventData |
  ALUIEventData |
  ALSurfaceMutationEventData |
  ALNetworkRequestEvent |
  ALNetworkResponseEvent |
  AdsALHeartbeatEventData |
  ALUIEventCaptureData |
  ALUIEventBubbleData);


type Node = {
  scratch?: {
    _event: Object,
  },
  data: {
    id: string;
    label: string;
    parent?: string;
    position?: {x: number, y: number};
    color?: string;
  }
};

type Edge = {
  data: {
    source: string;
    target: string;
    label: string;
    weight?: number;
  }
}

type GraphData = Array<Node | Edge>;

type GraphStyle = Array<{
  selector: 'node' | 'edge',
  style: {[key: string]: string | number}
}>;

type CyProps = {
  height: string;
  width: string;
  elements: GraphData;
  stylesheet?: GraphStyle;
};

const defaultStylesheet: GraphStyle = [
  {
    selector: 'node',
    style: {
      'background-color': 'data(color)',
      'label': 'data(label)'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 3,
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier'
    }
  }
];

function ALSessionPetri(props: CyProps) {
  // If we have a need to try using cytoscape directly instead of through CytoscapeComponent
  const container = React.useRef(null);
  const cy = React.useRef<cytoscape.Core | null>(null);
  const layout = {...LAYOUT, ...CONFIG};
  React.useEffect(() => {
    cy.current = Cytoscape(
      {
        container: container.current,
        elements: props.elements,
        style: props.stylesheet,
        layout: layout,
      }
    );
  });

  React.useEffect(() => {
    cy.current?.layout(layout).run()
  }, [props.elements, cy]);
  return  <div id="cy"
            className="test"
            style={{height: props.height, width: props.width}}
            ref={(container)}></div>;
}
const NodeColorMap = new Map([
  ['click', 'green'],
  ['click[al_ui_event]', 'green'],
  ['click[al_ui_event_capture]', 'lightgreen'],
  ['click[al_ui_event_bubble]', 'darkgreen'],
  ['network_request', 'gold'],
  ['network_response', 'yellow'],
  ['network', 'khaki'],
  ['mount', 'blue'],
  ['unmount', 'lightblue'],
  ['mount_component', 'blue'],
  ['unmount_component', 'lightblue'],
  ['heartbeat', 'red'],
  ['ad_spec_change', 'orange'],
  ['hover', 'purple'],
  ['parent', 'lightblue'],
  ['flowlet-part', 'gray'],
]);

const EdgeColorMap = new Map([
  ['flowlet', 'red'],
  ['seq', 'black'],
  ['ce', 'blue']
]);

function formatEventBufferMultiPass(events: Array<EventBody>, uiFlowlet: boolean = true, flowletFullName: boolean = true): GraphData {
  const elements = [];
  const eventNodes: Array<Node> = [];
  let nodeId = 0;
  let flowletsSeen: Array<{flowlet: string, flowletNodeId: number}> = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    // Event node
    const eventName = event.channelEventName != null ? `${event.event}[${event.channelEventName}]`: event.event;
    const srcNode = {
      scratch: {_event: event},
      data: {
        color: NodeColorMap.get(eventName),
        id: nodeId++,
        label: eventName,
      }
    }
    elements.push(srcNode);
    // If flowlet insert flowlet parent node
    const flowlet = uiFlowlet ? event.flowlet?.data?.uiEventFlowlet : event.flowlet;
    if (flowlet != null) {
      const flowletName = flowletFullName ? flowlet.fullName : flowlet.name;
      if (!(flowletName === '/top' || flowletName === 'top')) {
        // We match to a previous flowlet,  add edge to parent
        const matchFlowlet = flowletsSeen.find((val) => flowletName.includes(val.flowlet));
        if (matchFlowlet) {
          elements.push(
            {
              data: {
                source: matchFlowlet.flowletNodeId,
                target: srcNode.data.id,
                color: EdgeColorMap.get('flowlet'),
                label: matchFlowlet.flowletNodeId+'->'+srcNode.data.id,
              }
            }
          )
        }
        // Processing a new flowlet
        //else {
          const flowletParentId = nodeId++;
          flowletsSeen.push({flowlet: flowletName, flowletNodeId: flowletParentId});
          // Flowlet node
          const flowletParent = {
            scratch: {_event: event},
            data: {
              color: NodeColorMap.get('parent'),
              id: flowletParentId,
              label: flowletName,
            }
          }
          elements.push(flowletParent);
          // Edge from src to flowlet parent
          elements.push(
            {
              data: {
                source: srcNode.data.id,
                target: flowletParentId,
                color: EdgeColorMap.get('flowlet'),
                label: srcNode.data.id+'->'+flowletParentId,
              }
            }
          );
          const flowletParts = flowletName.split(/\/(?![^(]*\))/).filter(p => p != '');
          for (let k = 0; k < flowletParts.length; k++) {
            const nodeId = 'flowlet[' +flowletParentId+ ']'+ 'flowlet-part' + String(k);
            const previousNodeId = 'flowlet[' +flowletParentId+ ']'+ 'flowlet-part' + String(k-1);
            elements.push(
              {
                scratch: {_event: flowlet},
                data: {
                  parent: flowletParentId,
                  color: NodeColorMap.get('flowlet-part'),
                  id: nodeId,
                  label: flowletParts[k],
                }
              }
            )
            if (k > 0) {
              console.log('[PS] Part', flowletParts[k]);
              // add edge from previous
              elements.push(
                {
                  data: {
                    source: previousNodeId,
                    target: nodeId,
                    color: EdgeColorMap.get('seq'),
                    label: previousNodeId+'->'+nodeId,
                  }
                }
              );
            }
          }
        }
    }
    // Even if flowlet is available assign a sequential edge to last of eventNodes
    if (eventNodes) {
      const node = eventNodes.at(-1);
      if (node) {
        elements.push(
          {
            data: {
              source: node.data.id,
              target: srcNode.data.id,
              color: EdgeColorMap.get('seq'),
              label: node.data.id+'->'+srcNode.data.id,
            }
          }
        );
      }
    }
    eventNodes.push(srcNode);
  }

  return elements;
}

function formatEventBufferv2(events: Array<EventBody>): GraphData {
  // Sequential edges
  // Flowlet edges
  // Flowlet node
  // Event node
  const elements = [];
  const addEdge = [];
  const flowletMap = new Set();
  for (let i = 0; i < events.length; i++) {
    const id = i;
    const event = events[id];
    const flowlet = event.flowlet?.data?.uiEventFlowlet;

    const srcNode = {
      scratch: {_event: event},
      data: {
        color: NodeColorMap.get(events[i].event),
        id: id,
        label: events[i].event,
      }
    }
    elements.push(srcNode);
    if (flowlet != null) {
      // Create flowlet parent node,  split flowlet and create sub nodes within parent;
      const parentFlowletID = 'flowlet' + String(flowlet.id);
      const flowletParent = {
        scratch: {_event: event},
        data: {
          color: NodeColorMap.get('parent'),
          id: parentFlowletID,
          label: flowlet.name,
        }
      }
      elements.push(flowletParent);
      // Add edge from event to flowlet parent
      elements.push(
        {
          data: {
            source: id,
            target: parentFlowletID,
            label: id+'->'+parentFlowletID,
          }
        }
      );
      const flowletParts = flowlet.name.split(/\/(?![^(]*\))/);
      for (let k = 0; k < flowletParts.length; k++) {
        const nodeId = 'flowlet[' +parentFlowletID+ ']' + String(k);
        const previousNodeId = 'flowlet-part' + String(k-1);
        elements.push(
          {
            scratch: {_event: flowlet},
            data: {
              parent: parentFlowletID,
              color: NodeColorMap.get('flowlet-part'),
              id: nodeId,
              label: flowletParts[k],
            }
          }
        )
        if (k > 0) {
          // add edge from previous
          elements.push(
            {
              data: {
                source: previousNodeId,
                target: nodeId,
                color: EdgeColorMap.get('seq'),
                label: previousNodeId+'->'+nodeId,
              }
            }
          );
        }
      }
      const afterEvents = events.slice(i+1);
      for (let j = 0; j < afterEvents.length; j++) {
        const linkedNodeID = j + i + 1;
        const afterEvent = afterEvents[j];
        const checkFlowlet = afterEvent.flowlet?.data?.uiEventFlowlet;
        if (checkFlowlet == null) {
          continue;
        }
        if (checkFlowlet.name.includes(flowlet.name)) {
          // Add edges between linked nodes
          // TODO: potential to keep relinking,  might need to check that edge doesn't already exist
          elements.push(
            {
              data: {
                source: parentFlowletID,
                target: String(linkedNodeID),
                color: EdgeColorMap.get('flowlet'),
                label: parentFlowletID+'->'+String(linkedNodeID),
              }
            }
          )
        }
      }

      // Finally if parent is added add a edge from parent to next node
      if (i + 1 < events.length) {
        elements.push(
          {
            data: {
              source: parentFlowletID,
              target: String(i+1),
              color: EdgeColorMap.get('seq'),
              label: parentFlowletID+'->'+String(i+1),
            }
          }
        );
      }
    }
    if (i > 0) {
      // Just create a sequential edge to next node from previous
      elements.push(
        {
          data: {
            source: String(id - 1),
            target: String(id),
            label: String(id-1)+'->'+String(id),
          }
        }
      );
    }
  }
  return elements;
}

function formatEventBuffer(events: Array<EventBody>): GraphData {
  // Look into compound nodes for grouping non-ui events in compound nodes
  // https://js.cytoscape.org/#notation/compound-nodes via `parent` field
  const elements = [];
  // ui flowlet mapped to list of nodes matching,
  // generate a parent node from the key, and then children are within the parent
  const flowletMap = new Map<number, {flowlet: Object, source:string, links: Array<string>}>();
  // Iterate over all events, pushing events + edges
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const id = i.toString();
    if (event.flowlet != null) {
      const key = event.flowlet.data?.uiEventFlowlet?.id;
      if (key != null) {
        if (!flowletMap.has(key)) {
            flowletMap.set(key, {
              flowlet: event.flowlet.data?.uiEventFlowlet,
              source: id,
              links: []
            });
        }
        flowletMap.get(key)?.links.push(id);
      }
    }
    elements.push(
      {
        scratch: {_event: event},
        data: {
          color: NodeColorMap.get(events[i].event),
          id: id,
          label: events[i].event,
        }
      }
    );
    if (i > 0) {
      // Sequential edge
      elements.push(
        {
          data: {
            source: (i-1).toString(),
            target: i.toString(),
            label: (i-1).toString()+'->'+i.toString()
          }
        }
      );
    }
  }
  // Handle flowlet links
  for (const key of flowletMap.keys()) {
    const src = flowletMap.get(key)?.source;
    elements.push(
      // Parent node
      {
        data: {
          id: key,
          label: String(flowletMap.get(key)?.flowlet?.name),
          color: 'pink',
        }
      },
      // Edge from source to parent
      {
        data: {
          source: src,
          target: key,
          color: EdgeColorMap.get('flowlet'),
          label: src+'->'+key
        }
      },
    );
    if (parseInt(src)+1 < events.length) {
      elements.push(
        // NAIVE edge from parent to next index
        {
          data: {
            source: key,
            target: String(parseInt(src)+1),
            color: EdgeColorMap.get('flowlet'),
            label: key+'->'+String(parseInt(src)+1)
          }
        },
      )
    }
    // Links
    for(const link of flowletMap.get(key)?.links ?? []) {
      // Find the node id, and set it's parent prop to key
      // elements.find(element => element.data.id === link).data.parent = key;
      // Push edges from parent to child
      // elements.push(
      //   // Edge to parent
      //   {
      //     data: {
      //       target: key,
      //       source: link,
      //       label: link+'->'+key
      //     }
      //   }
      // );
    }
  }
  return elements;
}

function ALSessionPetriReact(props: CyProps) {
  const [listenerRegistered, setListenerRegistered] = React.useState(false);
  const [hide, setHide] = React.useState(false);
  const cy = React.useRef<cytoscape.Core | null>(null);

  const setCytoscape = React.useCallback(
    (ref: cytoscape.Core) => {
      cy.current = ref;
      cy.current.layout({...LAYOUT, ...CONFIG}).run();
      if (!listenerRegistered) {
        cy.current.on('click mouseover', 'node', (event) => {
          console.log('[PS]', event.type, event.target.data(), event.target.scratch());
        });
        cy.current.on('click', 'edge', (event) => {
          console.log('[PS]', event.type, event.target.data(), event.target.scratch());
        });

        setListenerRegistered(true);
      }
    },
    [cy],
  );

  return <>
    {!hide && <CytoscapeComponent
      cy={setCytoscape}
      stylesheet={props.stylesheet ?? defaultStylesheet}
      elements={props.elements}
      style={{width: props.width, height: props.height}}
      layout={LAYOUT}/>}
    <button onClick={() => setHide(!hide)}>{hide ? 'Show Graph' :'Hide Graph'}</button>
    <button onClick={() => {const e = Math.random() * 100; cy.current?.add([{ data: { id: 'one' + String(e), label: 'Node ' + e }, position: { x: 0, y: 0 } }])}}>Add Dummy Node</button>
    </>;
}

const blocklist = ['Petri'].join('|')


export default function ALSessionGraph() {
  const [eventBuffer, setEventBuffer] = React.useState<Array<EventBody>>([]);

  const addEvent = React.useCallback((event: EventBody): void => {
    setEventBuffer(eventBuffer => {
      // Skip clicks on the graph...
      if (event.targetElement != null && event.targetElement.nodeName === "CANVAS") {
        return eventBuffer;
      }
      // TODO: if we don't copy, then flowlet references for old events are changed
      const {flowlet, ...data} = event;
      let copied: EventBody = {
          ...data,
          ...{flowlet: (event.flowlet != null ? {
                name: event.flowlet.name,
                fullName: event.flowlet?.getFullName(),
                id: event.flowlet.id,
                data: event.flowlet.data.uiEventFlowlet != null ? {
                  uiEventFlowlet: {
                    id: event.flowlet.data.uiEventFlowlet.id,
                    name: event.flowlet.data.uiEventFlowlet.name,
                    fullName: event.flowlet.data.uiEventFlowlet.getFullName(),
                  }
                } : {}
              } : undefined)},
          flowletOriginal: event.flowlet,
      };
      return [...eventBuffer, copied];
  })}, []);

  React.useEffect(() => {
    // Set up listeners
    const removeListeners: Array<() => void> = [];
    const options = AutoLogging.getInitOptions();
    const uiChannel = options.uiEventPublisher?.channel;
    const uiEvents: Array<'al_ui_event' | 'al_ui_event_capture' | 'al_ui_event_bubble'> = [
      'al_ui_event',
      // 'al_ui_event_capture',
      // 'al_ui_event_bubble',
    ];
    uiEvents.forEach(eventName => {
      const listener = uiChannel?.on(eventName).add(e => addEvent({...e, channelEventName: eventName}));
      if (listener) {
        removeListeners.push(
          () => uiChannel?.removeListener(eventName, listener)
        );
      }
    });
    const surfaceChannel = options.surfaceMutationPublisher?.channel;
    const surfaceListener = surfaceChannel?.on('al_surface_mutation_event').add(addEvent);
    if (surfaceListener) {
      removeListeners.push(
        () => surfaceChannel?.removeListener('al_surface_mutation_event', surfaceListener)
      );
    }
    const heartbeatChannel = options.heartbeat?.channel;
    const heartbeatListener = heartbeatChannel?.on('al_heartbeat_event').add(addEvent);
    if (heartbeatListener) {
      removeListeners.push(
        () => heartbeatChannel?.removeListener('al_heartbeat_event', heartbeatListener)
      );
    }
    // With this enabled,  there's like an infinite loop of interception and emitting events /then/then/then/then/then/then/then/then/then/then/....
    // const flowletChannel = options.flowletPublisher?.channel;
    // const flowletListener = flowletChannel?.on('al_flowlet_event').add(e => addEvent({event: "flowlet_init", ...e}));
    // if (flowletListener) {
    //   removeListeners.push(
    //     () => flowletChannel?.removeListener('al_flowlet_event', flowletListener)
    //   );
    // }
    const networkChannel = options.network?.channel;
    const networkEvents: Array<'al_network_request' | 'al_network_response'> = [
      'al_network_request',
      'al_network_response',
    ];
    networkEvents.forEach(eventName => {
      const listener = networkChannel?.on(eventName).add(addEvent);
      if (listener) {
        removeListeners.push(
          () => networkChannel?.removeListener(eventName, listener)
        );
      }
    })

    // Remove registered listeners
    return () => removeListeners.forEach(rm => rm());
  }, [addEvent]);

  const testElements = [
    { data: { id: 'one', label: 'Node 1' }, position: { x: 0, y: 0 } },
    { data: { id: 'parent', label: 'Parent' }, position: { x: 0, y: 0 } },
    { data: { parent: 'parent', id: 'two', label: 'Node 2', color: 'blue'}, position: { x: 0, y: 0 } },
    { data: { parent: 'parent', id: 'three', label: 'Node 3', color: 'blue' }, position: { x: 0, y: 0 } },
    { data: { id: 'four', label: 'Node 3' }, position: { x: 0, y: 0 } },
    { data: { source: 'one', target: 'parent', label: 'Edge from Node1 to Parent' } },
    { data: { source: 'two', target: 'three', color: 'red', label: 'Edge from Node3 to Node4' } },
    { data: { source: 'parent', target: 'four', label: 'Edge from Parent to Node4' } }
  ];

  return (
    <div style={{width:"100%", display:"inline-block"}}>
      {/* <div style={{textAlign:"left", float:"left", width: "50px"}}>
        <pre>{JSON.stringify(eventBuffer.map((e, i) => {return {id: i, ev: e.event};}), undefined, 2)}</pre>
      </div> */}
      <div style={{textAlign:"left"}}>
      <div>
        <h2>Simple (UI Flowlet)</h2>
        <ALSessionPetriReact
            height={'200px'}
            width={'100%'}
            elements={formatEventBuffer(eventBuffer)} />
      </div>
        {/* <ALSessionPetriReact
          height={'200px'}
          width={'100%'}
          elements={formatEventBufferv2(eventBuffer)} /> */}
      <div>
        <h2>Flowlet (Non UI)</h2>
        <ALSessionPetriReact
          height={'200px'}
          width={'100%'}
          elements={formatEventBufferMultiPass(eventBuffer, false, true)} />
      </div>
      <div>
        <h2>UI Flowlet</h2>
        <ALSessionPetriReact
          height={'200px'}
          width={'100%'}
          elements={formatEventBufferMultiPass(eventBuffer, true, true)} />
      </div>
        {/* <ALSessionPetriReact
          height={'200px'}
          width={'100%'}
          elements={testElements} /> */}
        {/* <ALSessionPetri
          height={'200px'}
          width={'100%'}
          stylesheet={defaultStylesheet}
          elements={formatEventBuffer(eventBuffer)} /> */}
      </div>
    </div>
  );
}
