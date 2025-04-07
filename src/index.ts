// <!-- NAMESPACE:KEY=VALUE -->
export interface PerkdownTag {
  namespace: string;
  key: string;
  value: string;
}

export interface PerkdownParserSettings {
  renderBlocks: { [key: string]: string };
}

export interface EvaluatedPerkdown {
  markdown: string;
  meta: { [key: string]: string };
}

interface EvaluatedPerkdownBlock {
  markdown: string;
  meta: { [key: string]: string };
  remaining: string;
  errors: boolean;
}

export const SUPPORTED_VERSIONS = ["1.0"];

/** Evaluates the given perkdown string, upon encountering a syntax error this function will try to either ignore the error or return the original string to be parsed as a normal markdown string */
export function evaluatePerkdown(
  perkdown: string,
  settings: PerkdownParserSettings,
): EvaluatedPerkdown {
  if (!isPerkdown(perkdown)) {
    return { markdown: perkdown, meta: {} };
  }
  let evaluatedBlocks = [];
  // now lets go line by line looking for tags
  let out = evaluateBlock(perkdown, settings, {
    key: "_INTERNAL_",
    value: "MAIN_BLOCK",
  }) ?? {
    markdown: perkdown,
    meta: {},
  };
  return {
    markdown: out.markdown ?? perkdown,
    meta: out.meta,
  };
}

/** Same as `evaluatePerkdown( ... )` but returns undefined upon encountering any errors instead of trying to work around the problem. */
export function evaluatePerkdownStrict(
  perkdown: string,
  settings: PerkdownParserSettings,
): EvaluatedPerkdown | undefined {
  if (!isPerkdown(perkdown)) {
    return undefined;
  }
}

function evaluateBlock(
  perkdown: string,
  settings: PerkdownParserSettings,
  block: { key: string; value: string },
): EvaluatedPerkdownBlock {
  let lines = perkdown.split("\n");
  let currentBlock = "";
  let currentLine = 0;
  let errors = false;
  let meta: { [key: string]: string } = {};
  while (true) {
    if (currentLine >= lines.length) {
      if (block.key != "_INTERNAL_") {
        console.warn(
          "Missing closing tag for block: " + block.key + ":" + block.value,
        );
        errors = true;
      }
      break;
    }
    let tag = parsePerkdownTag(lines[currentLine]);
    if (
      tag?.namespace == "END" &&
      tag.key == block.key &&
      tag.value == block.value
    ) {
      currentLine++;
      break;
    }
    if (tag?.namespace == "META") {
      // Meta tag
      meta[tag.key] = tag.value;
    }
    if (tag?.namespace == "BEGIN") {
      // A new block is starting
      let res = evaluateBlock(
        lines.slice(currentLine + 1).join("\n"),
        settings,
        {
          key: tag.key,
          value: tag.value,
        },
      );
      currentBlock += res.markdown;
      lines = res.remaining.split("\n");
      currentLine = 0;
      meta = { ...meta, ...res.meta };
      if (res.errors) {
        errors = true;
      }
      continue;
    }
    if (tag == undefined) {
      currentBlock += lines[currentLine] + "\n";
    }
  }
  let remaining = lines.slice(currentLine - 1);
  let rem = remaining.join("\n");
  return {
    markdown: currentBlock,
    meta: meta,
    remaining: rem,
    errors: errors,
  };
}

export function isPerkdown(perkdown: string): boolean {
  let firstLine = perkdown.split("\n").shift();
  if (firstLine != undefined) {
    let tag = parsePerkdownTag(firstLine);
    if (tag != undefined) {
      return tag.namespace == "USE" && tag.key == "PRKMD";
    } else {
      return false;
    }
  }
  return false;
}

function parsePerkdownTag(tag: string): PerkdownTag | undefined {
  if (!tag.includes("<!--")) {
    return undefined;
  }
  let exp = /^( *?)<!--( *)([A-Z]*):([A-Z]*)=?(.*?)( *)-->( *?)$/gm;
  const result = tag.match(exp);
  if (result?.length == 4) {
    return {
      namespace: result[1],
      key: result[3],
      value: result[4],
    };
  }
  return undefined;
}
