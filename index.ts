import { getFavicon } from "./getFavicon";
import type { SearchEngine, Bang } from "./types";
import { OUTPUT, PREFIX, bangsFromDuckDuckGo, custom } from "./config";
import data from "./search.json.mozlz4.json";

function createSearchEngine({
  name,
  url,
  alias,
  icon,
}: {
  name: string;
  url: string;
  alias: string;
  icon: string;
}): SearchEngine {
  return {
    _name: name,
    _iconURL: icon,
    _loadPath: "[user]",
    _iconMapObj: { "32": icon },
    _metaData: { alias: `${PREFIX}${alias}` },
    _urls: [
      {
        template: url,
        rels: [],
        params: [],
      },
      {
        template: url,
        rels: [],
        params: [],
        type: "application/x-suggestions+json",
      },
    ],
  };
}

async function processCustom(): Promise<SearchEngine[]> {
  return Promise.all(
    custom.map(async (engine) => {
      const domain = new URL(engine.url).hostname;
      const icon =
        engine.iconURL ?? (await getFavicon(`https://${domain}`)) ?? "";
      return createSearchEngine({
        name: engine.name,
        url: engine.url,
        alias: engine.alias,
        icon,
      });
    }),
  );
}

async function processBangs(bangs: Bang[]): Promise<SearchEngine[]> {
  const selected = bangs.filter((b) => bangsFromDuckDuckGo.includes(b.t));

  return Promise.all(
    selected.map(async (bang) => {
      const url = bang.u.replace("{{{s}}}", "{searchTerms}");
      const domain = bang.d ?? new URL(url).hostname;
      const icon = (await getFavicon(`https://${domain}`)) ?? "";

      return createSearchEngine({
        name: bang.s ?? domain.split(".")[0]!,
        url,
        alias: bang.t,
        icon,
      });
    }),
  );
}

export async function getEngines() {
  const response = await fetch("https://duckduckgo.com/bang.js");
  const bangs = (await response.json()) as Bang[];

  const allEngines = data.engines as unknown as SearchEngine[];
  const defaultEngines = allEngines.filter((e) => e._isAppProvided);
  const existingAliases = new Set([
    ...defaultEngines.map((e) => e._metaData.alias),
    ...custom.map((e) => e.alias),
  ]);

  const enginesToAdd = allEngines.filter(
    (e) =>
      !e._isAppProvided &&
      !existingAliases.has(e._metaData.alias.replace(PREFIX, "")),
  );

  [...defaultEngines, ...enginesToAdd].forEach((e, i) => {
    e._metaData.order = i + 1;
  });

  const [customEngines, bangEngines] = await Promise.all([
    processCustom(),
    processBangs(bangs),
  ]);

  const finalEngines = [
    ...customEngines,
    ...defaultEngines,
    ...enginesToAdd,
    ...bangEngines,
  ];

  const { engines, ...rest } = data;

  const result = {
    engines: finalEngines,
    ...rest,
  };

  await Bun.write(OUTPUT, JSON.stringify(result));
  console.log(`Wrote ${finalEngines.length} engines to ${OUTPUT}`);
}

await getEngines();
