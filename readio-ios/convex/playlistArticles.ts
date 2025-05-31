import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getPlaylistWithArticles = query({
  args: { playlistId: v.string() },
  handler: async (ctx, args) => {
    // First try to get it as a regular playlist
    try {
      const playlist = await ctx.db.get(args.playlistId as Id<"playlists">);
      if (playlist && 'articles' in playlist) {
        // This is a regular playlist with articles array
        const articles = await Promise.all(
          playlist.articles.map(id => ctx.db.get(id))
        );
        return { 
          ...playlist, 
          articles: articles.filter(Boolean),
          type: 'playlist'
        };
      }
    } catch (error) {
      // Not a regular playlist, continue to try community playlist
    }

    // Try to get it as a community playlist
    try {
      const communityPlaylist = await ctx.db.get(args.playlistId as Id<"communityPlaylists">);
      if (communityPlaylist && 'name' in communityPlaylist) {
        // This is a community playlist - get articles by topic/name
        const articles = await ctx.db
          .query("articles")
          .withIndex("by_topic", (q) => q.eq("topic", communityPlaylist.name))
          .filter((q) => q.eq(q.field("nsfw"), false))
          .order("desc")
          .collect();
        
        return { 
          ...communityPlaylist, 
          articles: articles,
          type: 'communityPlaylist'
        };
      }
    } catch (error) {
      // Neither worked
    }

    // If neither worked, return null
    return null;
  },
});
