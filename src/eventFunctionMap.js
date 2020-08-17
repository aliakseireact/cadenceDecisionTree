
let parentMap = new Map();
parentMap.set(1, 0)

function printMap() {
  console.log(...parentMap)
}

//Helper function to check if map contains a value
let mapContainsValue = (map, val) => [...map.values()].includes(val)

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
  if (relativeKeys == 0) console.log('parent not found ' + node.eventType)
  return parentId
}

function setEdges(node) {
  let eventId = node.eventId;
  let parentId = parentMap.get(eventId);
  let containsChild = mapContainsValue(parentMap, eventId);
  let childId;

  if (parentMap.get(eventId) != null) {
    nodeInfo.edges.push({ parentId, eventId })
  }
  if (!containsChild) {
    childId = eventId + 1;
    nodeInfo.edges.push({ eventId, childId })
  }

  return nodeInfo
}

let nodeMap = {
  'WorkflowExecutionStarted': function (node) {
    return 0;
  },
  'ActivityTaskCanceled': function (node) {
    return node.eventId;
  },
  'ActivityTaskCancelRequested': function (node) {
    return node.eventId;
  },
  'ActivityTaskCompleted': function (node) {
    let childId = node.eventId + 1;

    console.log('in completed act ')

    let nodeInfo;

    return nodeInfo = {
      parentId: node['activityTaskCompletedEventAttributes']['startedEventId'],
      childId: childId
    }
  },
  'ActivityTaskFailed': function (node) {
    return node.eventId;
  },
  'ActivityTaskScheduled': function (node) {
    let parentId = node['activityTaskScheduledEventAttributes']['decisionTaskCompletedEventId']
    return parentId
  },
  'ActivityTaskStarted': function (node) {
    let parentId = node['activityTaskStartedEventAttributes']['scheduledEventId']
    return parentId
  },
  'ActivityTaskTimedOut': function (node) {
    return findParentId(node);
  },
  'CancelTimerFailed': function (node) {
    return findParentId(node);
  },
  'ChildWorkflowExecutionCanceled': function (node) {
    return findParentId(node);
  },
  'ChildWorkflowExecutionCompleted': function (node) {
    return findParentId(node);
  },
  'ChildWorkflowExecutionFailed': function (node) {
    return findParentId(node);
  },
  'ChildWorkflowExecutionStarted': function (node) {
    return findParentId(node);
  },
  'ChildWorkflowExecutionTerminated': function (node) {
    return findParentId(node);
  },
  'ChildWorkflowExecutionTimedOut': function (node) {
    return findParentId(node);
  },
  'DecisionTaskCompleted': function (node) {
    let parentId = node['decisionTaskCompletedEventAttributes']['startedEventId']
    return parentId
  },
  'DecisionTaskFailed': function (node) {
    return findParentId(node);
  },
  'DecisionTaskScheduled': function (node) {
    return node.eventId - 1;
  },
  'DecisionTaskStarted': function (node) {
    let parentId = node['decisionTaskStartedEventAttributes']['scheduledEventId']
    return parentId
  },
  'DecisionTaskTimedOut': function (node) {
    return findParentId(node);
  },
  'ExternalWorkflowExecutionCancelRequested': function (node) {
    return findParentId(node);
  },
  'ExternalWorkflowExecutionSignaled': function (node) {
    return findParentId(node);
  },
  'MarkerRecorded': function (node) {
    return findParentId(node);
  },
  'RequestCancelActivityTaskFailed': function (node) {
    return findParentId(node);
  },
  'RequestCancelExternalWorkflowExecutionFailed': function (node) {
    return findParentId(node);
  },
  'RequestCancelExternalWorkflowExecutionInitiated': function (node) {
    return findParentId(node);
  },
  'SignalExternalWorkflowExecutionFailed': function (node) {
    return findParentId(node);
  },
  'SignalExternalWorkflowExecutionInitiated': function (node) {
    return findParentId(node);
  },
  'StartChildWorkflowExecutionFailed': function (node) {
    return findParentId(node);
  },
  'StartChildWorkflowExecutionInitiated': function (node) {
    return findParentId(node);
  },
  'TimerCanceled': function (node) {
    return findParentId(node);
  },
  'TimerFired': function (node) {
    return findParentId(node);
  },
  'TimerStarted': function (node) {
    return findParentId(node);
  },
  'UpsertWorkflowSearchAttributes': function (node) {
    return findParentId(node);
  },
  'WorkflowExecutionCanceled': function (node) {
    return findParentId(node);
  },
  'WorkflowExecutionCancelRequested': function (node) {
    return findParentId(node);
  },
  'WorkflowExecutionCompleted': function (node) {
    return findParentId(node);
  },
  'WorkflowExecutionContinuedAsNew': function (node) {
    return findParentId(node);
  },
  'WorkflowExecutionFailed': function (node) {
    return findParentId(node);
  },
  'WorkflowExecutionSignaled': function (node) {
    return findParentId(node);
  },
  'WorkflowExecutionStarted': function (node) {
    return findParentId(node);
  },
  'WorkflowExecutionTerminated': function (node) {
    return findParentId(node);
  },
  'WorkflowExecutionTimedOut': function (node) {
    return findParentId(node);
  },
}

function callNodeMap(node) {
  return nodeMap[node.eventType](node)
}


// Exporting variables and functions
export { callNodeMap, setParent, printMap };