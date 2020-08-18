interface nodeInfo {
  parent?: number;
  child?: number;
}
function getNodeInfo(node, workflow) {
  return eventTypeMap[node.eventType](node, workflow)
}
let eventTypeMap = {
  'WorkflowExecutionStarted': function (node) {
    const nodeInfo: nodeInfo = {
      child: node.eventId + 1
    }
    return nodeInfo
  },
  'ActivityTaskCanceled': function (node) {
    return node.eventId;
  },
  'ActivityTaskCancelRequested': function (node) {
    return node.eventId;
  },
  'ActivityTaskCompleted': function (node) {
    let childId = node.eventId + 1;

    const nodeInfo: nodeInfo = {
      parent: node.activityTaskCompletedEventAttributes.startedEventId,
      child: childId
    }
    return nodeInfo
  },

  'ActivityTaskFailed': function (node) {
    return node.eventId;
  },
  'ActivityTaskScheduled': function (node) {
    const nodeInfo: nodeInfo = {
      parent: node.activityTaskScheduledEventAttributes.decisionTaskCompletedEventId
    }
    return nodeInfo
  },
  'ActivityTaskStarted': function (node) {
    const nodeInfo: nodeInfo = {
      parent: node.activityTaskStartedEventAttributes.scheduledEventId
    }
    return nodeInfo
  },
  'ActivityTaskTimedOut': function (node) {
    return node.eventId
  },
  'CancelTimerFailed': function (node) {
    return node.eventId
  },
  'ChildWorkflowExecutionCanceled': function (node) {
    return node.eventId
  },
  'ChildWorkflowExecutionCompleted': function (node) {
    return node.eventId
  },
  'ChildWorkflowExecutionFailed': function (node) {
    return node.eventId
  },
  'ChildWorkflowExecutionStarted': function (node) {
    return node.eventId
  },
  'ChildWorkflowExecutionTerminated': function (node) {
    return node.eventId
  },
  'ChildWorkflowExecutionTimedOut': function (node) {
    return node.eventId
  },
  'DecisionTaskCompleted': function (node, workflow) {
    const nodeInfo: nodeInfo = {
      parent: node.decisionTaskCompletedEventAttributes.startedEventId,
      child: findChild(node, workflow),
    }
    return nodeInfo
  },
  'DecisionTaskFailed': function (node) {
    return node.eventId
  },
  'DecisionTaskScheduled': function (node) {
    //Special case: Decision task is started by an event before it, use it as parent
    const nodeInfo: nodeInfo = {
      parent: node.eventId - 1
    }
    return nodeInfo
  },
  'DecisionTaskStarted': function (node) {
    const nodeInfo: nodeInfo = {
      parent: node.decisionTaskStartedEventAttributes.scheduledEventId
    }
    return nodeInfo
  },
  'DecisionTaskTimedOut': function (node) {
    return node.eventId
  },
  'ExternalWorkflowExecutionCancelRequested': function (node) {
    return node.eventId
  },
  'ExternalWorkflowExecutionSignaled': function (node) {
    return node.eventId
  },
  'MarkerRecorded': function (node) {
    const nodeInfo: nodeInfo = {
      parent: node.markerRecordedEventAttributes.decisionTaskCompletedEventId
    }
    return nodeInfo
  },
  'RequestCancelActivityTaskFailed': function (node) {
    return node.eventId
  },
  'RequestCancelExternalWorkflowExecutionFailed': function (node) {
    return node.eventId
  },
  'RequestCancelExternalWorkflowExecutionInitiated': function (node) {
    return node.eventId
  },
  'SignalExternalWorkflowExecutionFailed': function (node) {
    return node.eventId
  },
  'SignalExternalWorkflowExecutionInitiated': function (node) {
    return node.eventId
  },
  'StartChildWorkflowExecutionFailed': function (node) {
    return node.eventId
  },
  'StartChildWorkflowExecutionInitiated': function (node) {
    return node.eventId
  },
  'TimerCanceled': function (node) {
    //TODO
    const nodeInfo: nodeInfo = {
      parent: node.timerStartedEventAttributes.decisionTaskCompletedEventId
    }
    return nodeInfo
  },
  'TimerFired': function (node) {
    const nodeInfo: nodeInfo = {
      parent: node.timerFiredEventAttributes.startedEventId
    }
    return nodeInfo
  },
  'TimerStarted': function (node) {
    const nodeInfo: nodeInfo = {
      parent: node.timerStartedEventAttributes.decisionTaskCompletedEventId
    }
    return nodeInfo
  },
  'UpsertWorkflowSearchAttributes': function (node) {
    return node.eventId
  },
  'WorkflowExecutionCanceled': function (node) {
    return node.eventId
  },
  'WorkflowExecutionCancelRequested': function (node) {
    return node.eventId
  },
  'WorkflowExecutionCompleted': function (node) {
    const nodeInfo: nodeInfo = {
      parent: node.eventId - 1
    }
    return nodeInfo
  },
  'WorkflowExecutionContinuedAsNew': function (node) {
    const nodeInfo: nodeInfo = {
      parent: node.workflowExecutionContinuedAsNewEventAttributes.decisionTaskCompletedEventId
    }
    return nodeInfo
  },
  'WorkflowExecutionFailed': function (node) {
    return node.eventId
  },
  'WorkflowExecutionSignaled': function (node, workflow) {
    const nodeInfo: nodeInfo = {
      child: findChild(node, workflow)
    }
    return nodeInfo
  },
  'WorkflowExecutionTerminated': function (node) {
    return node.eventId
  },
  'WorkflowExecutionTimedOut': function (node) {
    return node.eventId
  },
}
function findChild(node, workflow): number {
  //Signals do not have parents
  let skipString = 'WorkflowExecutionSignaled'
  let childId = 0;
  //Start searching after current node event ID
  let slicedWorkflow = workflow.slice(node.eventId)
  for (let targetNode of slicedWorkflow) {
    //We've found the first node that is not a signal - that is the child
    if (targetNode.eventType !== skipString) {
      childId = targetNode.eventId
      break
    }
  }
  return childId;
}


// Exporting variables and functions
export { getNodeInfo };