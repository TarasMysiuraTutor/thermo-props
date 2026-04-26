import * as Water from "./water/water.js";
import { waterMeta } from "./water/meta.js";

import * as Air from "./air/air.js";
import { airMeta } from "./air/meta.js";

export const substances = {
  water: {
    id: "water",
    meta: waterMeta,
    api: Water,
  },
  air: {
    id: "air",
    meta: airMeta,
    api: Air,
  },
};

export const DEFAULT_SUBSTANCE_ID = "water";
``