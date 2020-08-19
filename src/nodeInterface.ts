interface nodeInfo {
  parent?: number;
  child?: number;
  inferredParents?: number[];
}

interface workflow {
  [index: number]: node
}

interface node {
  eventType: string;
  eventId: number;
  [key: string]: any;
}

interface workflow extends Array<node> { }

export { nodeInfo, node, workflow };