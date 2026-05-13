export type GraphNode = {
  id: string;
  name: string;
  type: string;
  summary: string;
};

export type GraphLink = {
  source: string;
  target: string;
  name: string;
  fact: string;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};
