import type { Custom } from "./types";

export const PREFIX = "@";
export const OUTPUT = "output.json";

export const bangsFromDuckDuckGo = ["npm", "gi", "gh", "yt"];

export const custom: Custom[] = [
  {
    alias: "chatgpt",
    url: "https://chat.openai.com/?q={searchTerms}",
    name: "ChatGPT",
  },
  {
    alias: "hbo",
    url: "https://play.max.com/search/result?q={searchTerms}",
    name: "HBO Max",
  },
  {
    alias: "prime",
    url: "https://www.primevideo.com/search?phrase={searchTerms}",
    name: "Prime Video",
  },
];
