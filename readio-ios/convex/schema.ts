import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    // Core user info
    name: v.optional(v.string()),
    email: v.string(),
    pass: v.optional(v.string()),
    jwt: v.optional(v.string()),
    user_db_id: v.optional(v.string()),
    
    // Subscription & billing
    subscription_plan: v.optional(v.string()), // 'blank', 'starter', 'premium'
    subscription_tier: v.optional(v.string()),
    user_role: v.optional(v.string()), // 'admin', 'user'
    coin_balance: v.optional(v.number()),
    
    // Article generation limits
    article_generation_runs: v.optional(v.number()),
    article_generation_runs_limit: v.optional(v.number()),
    article_runs_last_reset_at: v.optional(v.string()),
    
    // User stats & activity
    upvotes: v.optional(v.number()),
    usersteps: v.optional(v.number()),
    user_meditation_minutes: v.optional(v.number()),
    stic_voice_usage_seconds: v.optional(v.number()),
    
    // Streak tracking (stored as JSON)
    presence_current_streak: v.optional(v.any()), // JSON array
    presence_highest_streak: v.optional(v.number()),
    giant_steps_current_streak: v.optional(v.any()), // JSON array
    giant_steps_highest_streak: v.optional(v.number()),
    
    // Activity stats (stored as JSON)
    presence_stats: v.optional(v.any()), // JSON array
    giant_steps_stats: v.optional(v.any()), // JSON array
    
    // Timestamps
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_jwt", ["jwt"])
    .index("by_user_db_id", ["user_db_id"]),

  // Articles/Readios table
  readios: defineTable({
    title: v.string(),
    text: v.optional(v.string()),
    artwork: v.optional(v.string()),
    url: v.optional(v.string()),
    topic: v.optional(v.string()),
    artist: v.optional(v.string()),
    tag: v.optional(v.string()),
    user_db_id: v.optional(v.string()),
    username: v.optional(v.string()),
    upvotes: v.optional(v.number()),
    favorited: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    nsfw: v.optional(v.boolean()),
    duration: v.optional(v.number()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_user_db_id", ["user_db_id"])
    .index("by_topic", ["topic"])
    .index("by_featured", ["featured"])
    .index("by_nsfw", ["nsfw"])
    .index("by_created_at", ["created_at"]),

  // Stations/Categories table
  stations: defineTable({
    name: v.string(),
    imageurl: v.optional(v.string()),
    user_db_id: v.optional(v.string()),
    created_at: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_user_db_id", ["user_db_id"]),

  // Playlists table
  playlists: defineTable({
    name: v.string(),
    user_db_id: v.string(),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_user_db_id", ["user_db_id"])
    .index("by_name", ["name"]),

  // Playlist-Readio relationships
  playlist_readios: defineTable({
    playlist_id: v.number(),
    readio_id: v.number(),
    playlist: v.optional(v.string()),
    readio: v.optional(v.string()),
    user_db_id: v.string(),
    created_at: v.optional(v.string()),
  })
    .index("by_playlist_id", ["playlist_id"])
    .index("by_readio_id", ["readio_id"])
    .index("by_user_db_id", ["user_db_id"]),

  // Favorites table
  favorites: defineTable({
    readio_id: v.number(),
    user_id: v.string(),
    created_at: v.optional(v.string()),
  })
    .index("by_readio_id", ["readio_id"])
    .index("by_user_id", ["user_id"])
    .index("by_readio_user", ["readio_id", "user_id"]),

  // Upvotes table
  upvotes: defineTable({
    readio_id: v.number(),
    user_id: v.string(),
    created_at: v.optional(v.string()),
  })
    .index("by_readio_id", ["readio_id"])
    .index("by_user_id", ["user_id"])
    .index("by_readio_user", ["readio_id", "user_id"]),

  // Liner Notes table
  liner_notes: defineTable({
    title: v.string(),
    text: v.optional(v.string()),
    artwork: v.optional(v.string()),
    url: v.optional(v.string()),
    topic: v.optional(v.string()),
    artist: v.optional(v.string()),
    duration: v.optional(v.number()),
    created_at: v.optional(v.string()),
  })
    .index("by_topic", ["topic"])
    .index("by_created_at", ["created_at"]),

  // Audiobooks table
  audiobooks: defineTable({
    audiobook_name: v.string(),
    author: v.string(),
    duration: v.optional(v.number()),
    audio_url: v.optional(v.string()),
    audiobook_image: v.optional(v.string()),
    audiobook_description: v.optional(v.string()),
    chapters: v.optional(v.any()), // JSON array
    created_at: v.optional(v.string()),
  })
    .index("by_author", ["author"])
    .index("by_audiobook_name", ["audiobook_name"]),

  // Meditations table
  meditations: defineTable({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    meditation_season_music: v.any(), // JSON array
    created_at: v.optional(v.string()),
  })
    .index("by_created_at", ["created_at"]),

  // Fithop table (music albums)
  fithop: defineTable({
    album_name: v.optional(v.string()),
    album_image: v.optional(v.string()),
    album_songs: v.optional(v.any()), // JSON array
    created_at: v.optional(v.string()),
  })
    .index("by_album_name", ["album_name"]),

  // Content Analytics table
  content_analytics: defineTable({
    content_type: v.string(), // 'article', 'music', 'audiobook', etc.
    content_id: v.optional(v.number()),
    item_url: v.optional(v.string()),
    plays: v.optional(v.number()),
    completes: v.optional(v.number()),
    skips: v.optional(v.number()),
    last_played_at: v.optional(v.string()),
    created_at: v.optional(v.string()),
  })
    .index("by_content_type", ["content_type"])
    .index("by_content_id", ["content_id"])
    .index("by_item_url", ["item_url"])
    .index("by_content_type_id_url", ["content_type", "content_id", "item_url"]),

  // Environment Variables table
  env_variables: defineTable({
    key: v.string(),
    value: v.string(),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  })
    .index("by_key", ["key"]),

  // Steps tracking table
  steps: defineTable({
    total: v.optional(v.number()),
    created_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
  }),

  // Waitlist table (for landing page)
  waitlist: defineTable({
    email: v.string(),
    created_at: v.optional(v.string()),
  })
    .index("by_email", ["email"]),

  // Request locks table (for rate limiting)
  request_locks: defineTable({
    user_id: v.string(),
    content_type: v.string(),
    created_at: v.optional(v.string()),
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_content", ["user_id", "content_type"]),
}); 