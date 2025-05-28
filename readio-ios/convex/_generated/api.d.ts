/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as articleGeneration from "../articleGeneration.js";
import type * as articleMutations from "../articleMutations.js";
import type * as articles from "../articles.js";
import type * as audiobooks from "../audiobooks.js";
import type * as communityPlaylists from "../communityPlaylists.js";
import type * as contentAnalytics from "../contentAnalytics.js";
import type * as envVariables from "../envVariables.js";
import type * as favorites from "../favorites.js";
import type * as fithop from "../fithop.js";
import type * as linerNotes from "../linerNotes.js";
import type * as meditations from "../meditations.js";
import type * as playlistArticles from "../playlistArticles.js";
import type * as playlists from "../playlists.js";
import type * as steps from "../steps.js";
import type * as stepsLeaderboard from "../stepsLeaderboard.js";
import type * as upvotes from "../upvotes.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  articleGeneration: typeof articleGeneration;
  articleMutations: typeof articleMutations;
  articles: typeof articles;
  audiobooks: typeof audiobooks;
  communityPlaylists: typeof communityPlaylists;
  contentAnalytics: typeof contentAnalytics;
  envVariables: typeof envVariables;
  favorites: typeof favorites;
  fithop: typeof fithop;
  linerNotes: typeof linerNotes;
  meditations: typeof meditations;
  playlistArticles: typeof playlistArticles;
  playlists: typeof playlists;
  steps: typeof steps;
  stepsLeaderboard: typeof stepsLeaderboard;
  upvotes: typeof upvotes;
  users: typeof users;
  waitlist: typeof waitlist;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
