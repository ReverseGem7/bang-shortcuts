export type SearchEngine = {
  _name: string;
  _iconURL: string;
  _loadPath: "[user]";
  _isAppProvided?: boolean;
  _iconMapObj: Record<string, string>;
  _metaData: {
    alias: string;
    order?: number;
  };
  _urls: Array<{
    template: string;
    rels: never[];
    params: never[];
    type?: "application/x-suggestions+json";
  }>;
};

export type Bang = {
  t: string;
  u: string;
  c?: string;
  sc?: string;
  d?: string;
  s?: string;
  r?: number;
};

export type Custom = {
  name: string;
  iconURL?: string;
  alias: string;
  url: string;
};
