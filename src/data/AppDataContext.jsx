import { useCallback, useEffect, useRef, useState } from "react";
import { AppDataContext } from "./AppDataContextValue";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const starterDevotionals = [
  {
    id: "mark-16-15",
    title: "Go into all the world",
    reference: "Mark 16:15",
    scripture: "Go into all the world and preach the gospel to all creation.",
    reflection: "The Gospel is not something we keep to ourselves. God has placed us where we are so that our words, actions and lives can point people toward Jesus.",
    prayer: "Lord, give me courage to share Your love today. Open my eyes to the people around me and help my life point others to Jesus. Amen.",
    publishedAt: "2026-08-18",
    status: "published",
    likes: 0,
    completions: 0,
    comments: 0,
  },
  {
    id: "one-body",
    title: "Many parts, one body",
    reference: "1 Corinthians 12:12",
    scripture: "Just as a body, though one, has many parts, but all its many parts form one body, so it is with Christ.",
    reflection: "Your place in the Body of Christ matters. We become stronger when every believer brings their gifts, story and faith into the family.",
    prayer: "Jesus, show me how to serve Your people with humility and joy. Make me a source of unity today. Amen.",
    publishedAt: "2026-08-17",
    status: "published",
    likes: 0,
    completions: 0,
    comments: 0,
  },
];

const starterMediaPosts = [];
const starterCommunityPosts = [];

function readStorage(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readStorage(key, fallback));

  const update = useCallback((nextValue) => {
    setValue((currentValue) => {
      const resolvedValue = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;
      window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      return resolvedValue;
    });
  }, [key]);

  return [value, update];
}

function summarizeActivity(activity = {}, mediaActivity = {}) {
  const completed = activity.completed || [];
  const liked = activity.liked || [];
  const comments = activity.comments || [];
  const mediaLiked = mediaActivity.liked || 0;
  const mediaComments = mediaActivity.comments || 0;
  const points = completed.length * 10 + liked.length * 3 + comments.length * 5 + mediaLiked * 3 + mediaComments * 5;
  const grade = points >= 100 ? "A+" : points >= 70 ? "A" : points >= 40 ? "B" : points >= 15 ? "C" : points > 0 ? "D" : "-";
  const label = points >= 70 ? "Highly active" : points >= 40 ? "Active" : points > 0 ? "Growing" : "Getting started";
  return { points, grade, label, completed: completed.length, liked: liked.length + mediaLiked, comments: comments.length + mediaComments };
}

export function AppDataProvider({ children }) {
  const [member, setMember] = useStoredState("gto-member-v2", null);
  const [members, setMembers] = useStoredState("gto-members-v2", []);
  const [admin, setAdmin] = useStoredState("gto-admin-v2", null);
  const [devotionals, setDevotionals] = useStoredState("gto-devotionals-v2", starterDevotionals);
  const [mediaPosts, setMediaPosts] = useStoredState("gto-media-posts-v1", starterMediaPosts);
  const [communityPosts, setCommunityPosts] = useStoredState("gto-community-posts-v1", starterCommunityPosts);
  const [engagement, setEngagement] = useStoredState("gto-engagement-v2", {});
  const [backendLoading, setBackendLoading] = useState(isSupabaseConfigured);
  const [mediaUpdateNotice, setMediaUpdateNotice] = useState("");
  const remoteActions = useRef({});

  const memberEngagement = member ? (engagement[member.id] || { completed: [], liked: [], comments: [] }) : { completed: [], liked: [], comments: [] };
  const memberMediaActivity = {
    liked: mediaPosts.filter((post) => post.likedByMember).length,
    comments: mediaPosts.reduce((total, post) => total + (post.comments || []).filter((comment) => comment.userId === member?.id).length, 0),
  };
  const memberActivity = summarizeActivity(memberEngagement, memberMediaActivity);
  const memberBadges = [
    memberActivity.completed >= 1 && { icon: "✦", name: "First step", detail: "Completed a devotional" },
    memberActivity.completed >= 3 && { icon: "☼", name: "Word walker", detail: "Completed three devotionals" },
    memberActivity.liked >= 3 && { icon: "♡", name: "Word keeper", detail: "Saved three words" },
    memberActivity.comments >= 1 && { icon: "✎", name: "Encourager", detail: "Shared encouragement" },
    communityPosts.some((post) => post.supportedByMember) && { icon: "♥", name: "Standing with you", detail: "Supported the community" },
  ].filter(Boolean);
  const activityLeaderboard = members
    .filter((profile) => profile.role !== "admin")
    .map((profile) => {
      const mediaActivity = {
        liked: mediaPosts.reduce((total, post) => total + ((post.likedUserIds || []).includes(profile.id) ? 1 : 0), 0),
        comments: mediaPosts.reduce((total, post) => total + (post.comments || []).filter((comment) => comment.userId === profile.id).length, 0),
      };
      return { ...profile, activity: summarizeActivity(engagement[profile.id], mediaActivity) };
    })
    .sort((first, second) => second.activity.points - first.activity.points);

  const applyRemoteSession = async (session) => {
    if (!session?.user || !supabase) {
      setMember(null);
      setAdmin(null);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("id, full_name, role, created_at").eq("id", session.user.id).single();
    if (profile) {
      setMember({ id: profile.id, name: profile.full_name, email: session.user.email, joinedAt: profile.created_at, role: profile.role });
      if (profile.role === "admin") setAdmin({ id: profile.id, email: session.user.email, role: "admin" });
    }
  };

  const loadRemoteData = async () => {
    if (!supabase) return;
    const { data: remoteProfiles } = await supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false });
    const { data: remoteDevotionals } = await supabase.from("devotionals").select("id, title, reference, scripture, reflection, prayer, published_at").order("published_at", { ascending: false });
    const { data: remoteMediaPosts } = await supabase.from("media_posts").select("id, kind, title, body, media_url, published_at, profiles(full_name)").order("published_at", { ascending: false });
    const { data: remoteMediaComments } = await supabase.from("media_comments").select("id, media_post_id, user_id, body, created_at, profiles(full_name)").order("created_at", { ascending: false });
    const { data: remoteMediaReactions } = await supabase.from("media_reactions").select("media_post_id, user_id, liked");
    const { data: remoteCommunityPosts } = await supabase.from("community_posts").select("id, kind, title, body, user_id, created_at, profiles(full_name)").order("created_at", { ascending: false });
    const { data: remoteCommunitySupport } = await supabase.from("community_support").select("post_id, user_id, kind");
    if (remoteProfiles) {
      setMembers(remoteProfiles.map((profile) => ({
        id: profile.id,
        name: profile.full_name,
        email: "",
        joinedAt: profile.created_at,
        role: profile.role,
      })));
    }
    if (remoteDevotionals) {
      const { data: remoteEngagement } = await supabase.from("devotional_engagement").select("devotional_id, user_id, liked, completed");
      const { data: remoteComments } = await supabase.from("devotional_comments").select("id, devotional_id, user_id, body, created_at, profiles(full_name)").order("created_at", { ascending: false });
      const nextEngagement = {};
      (remoteEngagement || []).forEach((item) => {
        const current = nextEngagement[item.user_id] || { completed: [], liked: [], comments: [] };
        if (item.liked) current.liked.push(item.devotional_id);
        if (item.completed) current.completed.push(item.devotional_id);
        nextEngagement[item.user_id] = current;
      });
      (remoteComments || []).forEach((item) => {
        const current = nextEngagement[item.user_id] || { completed: [], liked: [], comments: [] };
        current.comments.push({ id: item.id, devotionalId: item.devotional_id, author: item.profiles?.full_name || "GTO member", text: item.body, createdAt: item.created_at });
        nextEngagement[item.user_id] = current;
      });
      setEngagement(nextEngagement);
      setDevotionals(remoteDevotionals.map((item) => ({
        ...item,
        publishedAt: item.published_at,
        likes: (remoteEngagement || []).filter((engagementItem) => engagementItem.devotional_id === item.id && engagementItem.liked).length,
        completions: (remoteEngagement || []).filter((engagementItem) => engagementItem.devotional_id === item.id && engagementItem.completed).length,
        comments: (remoteComments || []).filter((comment) => comment.devotional_id === item.id).length,
      })));
    }
    if (remoteMediaPosts) {
      setMediaPosts(remoteMediaPosts.map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        body: item.body,
        mediaUrl: item.media_url,
        publishedAt: item.published_at,
        author: item.profiles?.full_name || "GTO team",
        comments: (remoteMediaComments || []).filter((comment) => comment.media_post_id === item.id).map((comment) => ({ id: comment.id, userId: comment.user_id, author: comment.profiles?.full_name || "GTO member", text: comment.body, createdAt: comment.created_at })),
        likes: (remoteMediaReactions || []).filter((reaction) => reaction.media_post_id === item.id && reaction.liked).length,
        likedUserIds: (remoteMediaReactions || []).filter((reaction) => reaction.media_post_id === item.id && reaction.liked).map((reaction) => reaction.user_id),
        likedByMember: (remoteMediaReactions || []).some((reaction) => reaction.media_post_id === item.id && reaction.user_id === member?.id && reaction.liked),
      })));
    }
    if (remoteCommunityPosts) {
      setCommunityPosts(remoteCommunityPosts.map((post) => ({
        id: post.id,
        kind: post.kind,
        title: post.title,
        body: post.body,
        userId: post.user_id,
        author: post.profiles?.full_name || "GTO member",
        createdAt: post.created_at,
        supportCount: (remoteCommunitySupport || []).filter((support) => support.post_id === post.id).length,
        supportedByMember: (remoteCommunitySupport || []).some((support) => support.post_id === post.id && support.user_id === member?.id),
      })));
    }
  };

  remoteActions.current = { applyRemoteSession, loadRemoteData };

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      if (active) {
        await remoteActions.current.applyRemoteSession(data.session);
        await remoteActions.current.loadRemoteData();
        setBackendLoading(false);
      }
    };
    initialize();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setMember(null);
        setAdmin(null);
      } else if (session) {
        remoteActions.current.applyRemoteSession(session);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [setMember, setAdmin]);

  useEffect(() => {
    if (!supabase) return undefined;
    const channel = supabase
      .channel("gto-live-media")
      .on("postgres_changes", { event: "*", schema: "public", table: "media_posts" }, (payload) => {
        if (payload.eventType === "INSERT") setMediaUpdateNotice("New GTO update just arrived.");
        remoteActions.current.loadRemoteData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "media_comments" }, () => remoteActions.current.loadRemoteData())
      .on("postgres_changes", { event: "*", schema: "public", table: "media_reactions" }, () => remoteActions.current.loadRemoteData())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => remoteActions.current.loadRemoteData())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_support" }, () => remoteActions.current.loadRemoteData())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const joinCommunity = async (profile) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email: profile.email.trim(), password: profile.password, options: { data: { full_name: profile.name.trim() } } });
      if (error) throw error;
      if (data.session) await applyRemoteSession(data.session);
      else throw new Error("Your account was created. Check your email to confirm it, then sign in.");
      return;
    }
    const nextMember = {
      id: `member-${Date.now()}`,
      name: profile.name.trim(),
      email: profile.email.trim(),
      joinedAt: new Date().toISOString(),
      role: "member",
    };
    setMember(nextMember);
    setMembers((current) => [...current.filter((item) => item.email !== nextMember.email), nextMember]);
  };

  const signInMember = async (email, password) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return false;
      await applyRemoteSession(data.session);
      return true;
    }
    const existing = members.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!existing) return false;
    setMember(existing);
    return true;
  };

  const leaveCommunity = () => setMember(null);
  const signOutAdmin = async () => {
    if (supabase) await supabase.auth.signOut();
    setAdmin(null);
  };
  const signInAdmin = async (email, password) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { success: false, error: error.message };
      await applyRemoteSession(data.session);
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        return { success: false, error: "This account is valid, but it has not been promoted to the admin role yet." };
      }
      return { success: true };
    }
    const valid = email.trim().toLowerCase() === "admin@gtooutreach.org" && password === "GTO-Admin-2026";
    if (!valid) return false;
    setAdmin({ email: "admin@gtooutreach.org", role: "admin" });
    return { success: true };
  };

  const toggleLike = (devotionalId) => {
    if (!member) return;
    if (supabase) {
      const current = memberEngagement.liked.includes(devotionalId);
      supabase.from("devotional_engagement").upsert({ devotional_id: devotionalId, user_id: member.id, liked: !current, completed: memberEngagement.completed.includes(devotionalId) }).then(loadRemoteData);
      return;
    }
    setEngagement((current) => {
      const currentMember = current[member.id] || memberEngagement;
      const hasLiked = currentMember.liked.includes(devotionalId);
      const nextMember = {
        ...currentMember,
        liked: hasLiked ? currentMember.liked.filter((id) => id !== devotionalId) : [...currentMember.liked, devotionalId],
      };
      return {
        ...current,
        [member.id]: nextMember,
      };
    });

    setDevotionals((current) => current.map((item) => (
      item.id === devotionalId
        ? { ...item, likes: Math.max(0, item.likes + (memberEngagement.liked.includes(devotionalId) ? -1 : 1)) }
        : item
    )));
  };

  const markComplete = (devotionalId) => {
    if (!member || memberEngagement.completed.includes(devotionalId)) return;
    if (supabase) {
      supabase.from("devotional_engagement").upsert({ devotional_id: devotionalId, user_id: member.id, liked: memberEngagement.liked.includes(devotionalId), completed: true }).then(loadRemoteData);
      return;
    }
    setEngagement((current) => ({ ...current, [member.id]: { ...memberEngagement, completed: [...memberEngagement.completed, devotionalId] } }));
    setDevotionals((current) => current.map((item) => (
      item.id === devotionalId ? { ...item, completions: item.completions + 1 } : item
    )));
  };

  const addComment = (devotionalId, text) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    if (!member) return;
    if (supabase) {
      supabase.from("devotional_comments").insert({ devotional_id: devotionalId, user_id: member.id, body: trimmedText }).then(loadRemoteData);
      return;
    }
    setEngagement((current) => ({
      ...current,
      [member.id]: {
        ...memberEngagement,
        comments: [
          ...memberEngagement.comments,
        {
          id: `comment-${Date.now()}`,
          devotionalId,
          author: member?.name || "GTO member",
          text: trimmedText,
          createdAt: new Date().toISOString(),
          },
        ],
      },
    }));
    setDevotionals((current) => current.map((item) => (
      item.id === devotionalId ? { ...item, comments: item.comments + 1 } : item
    )));
  };

  const publishDevotional = (draft) => {
    if (supabase && admin) {
      supabase.from("devotionals").insert({ title: draft.title, reference: draft.reference, scripture: draft.scripture, reflection: draft.reflection, prayer: draft.prayer, published_by: admin.id }).then(loadRemoteData);
      return;
    }
    setDevotionals((current) => [
      {
        ...draft,
        id: `devotional-${Date.now()}`,
        publishedAt: new Date().toISOString().slice(0, 10),
        status: "published",
        likes: 0,
        completions: 0,
        comments: 0,
      },
      ...current,
    ]);
  };

  const publishMediaPost = async (draft) => {
    let mediaUrl = draft.mediaUrl.trim();
    if (supabase && admin && draft.file) {
      const filePath = `${admin.id}/${Date.now()}-${draft.file.name}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(filePath, draft.file, { contentType: draft.file.type, upsert: false });
      if (uploadError) throw uploadError;
      mediaUrl = supabase.storage.from("media").getPublicUrl(filePath).data.publicUrl;
    } else if (!supabase && draft.file) {
      mediaUrl = URL.createObjectURL(draft.file);
    }
    const post = {
      kind: draft.kind,
      title: draft.title.trim(),
      body: draft.body.trim(),
      mediaUrl,
      publishedAt: new Date().toISOString(),
    };
    if (supabase && admin) {
      const { error } = await supabase.from("media_posts").insert({ kind: post.kind, title: post.title, body: post.body, media_url: post.mediaUrl || null, published_by: admin.id });
      if (error) throw error;
      await loadRemoteData();
      return;
    }
    setMediaPosts((current) => [{ ...post, id: `media-${Date.now()}`, author: admin?.email || "GTO team" }, ...current]);
  };

  const addMediaComment = async (mediaPostId, text) => {
    const trimmedText = text.trim();
    if (!member || !trimmedText) return;
    if (supabase) {
      const { error } = await supabase.from("media_comments").insert({ media_post_id: mediaPostId, user_id: member.id, body: trimmedText });
      if (!error) await loadRemoteData();
      return;
    }
    setMediaPosts((current) => current.map((post) => post.id === mediaPostId ? {
      ...post,
      comments: [...(post.comments || []), { id: `media-comment-${Date.now()}`, userId: member.id, author: member.name, text: trimmedText, createdAt: new Date().toISOString() }],
    } : post));
  };

  const deleteMediaComment = async (mediaPostId, commentId) => {
    if (!admin) return;
    if (supabase) {
      const { error } = await supabase.from("media_comments").delete().eq("id", commentId);
      if (!error) await loadRemoteData();
      return;
    }
    setMediaPosts((current) => current.map((post) => post.id === mediaPostId ? {
      ...post,
      comments: (post.comments || []).filter((comment) => comment.id !== commentId),
    } : post));
  };

  const toggleMediaLike = async (mediaPostId) => {
    if (!member) return { success: false, error: "Sign in as a member to like this post." };
    const post = mediaPosts.find((item) => item.id === mediaPostId);
    const nextLiked = !post?.likedByMember;
    if (supabase) {
      const { error } = await supabase.from("media_reactions").upsert({ media_post_id: mediaPostId, user_id: member.id, liked: nextLiked });
      if (error) return { success: false, error: error.message };
      await loadRemoteData();
      return { success: true };
    }
    setMediaPosts((current) => current.map((item) => item.id === mediaPostId ? { ...item, likes: Math.max(0, (item.likes || 0) + (nextLiked ? 1 : -1)), likedByMember: nextLiked, likedUserIds: nextLiked ? [...(item.likedUserIds || []), member.id] : (item.likedUserIds || []).filter((id) => id !== member.id) } : item));
    return { success: true };
  };

  const deleteMediaPost = async (mediaPostId) => {
    if (!admin) return;
    if (supabase) {
      const { error } = await supabase.from("media_posts").delete().eq("id", mediaPostId);
      if (!error) await loadRemoteData();
      return;
    }
    setMediaPosts((current) => current.filter((post) => post.id !== mediaPostId));
  };

  const updateMediaPost = async (mediaPostId, changes) => {
    if (!admin) return;
    if (supabase) {
      const { error } = await supabase.from("media_posts").update({ title: changes.title.trim(), body: changes.body.trim() }).eq("id", mediaPostId);
      if (!error) await loadRemoteData();
      return;
    }
    setMediaPosts((current) => current.map((post) => post.id === mediaPostId ? { ...post, title: changes.title.trim(), body: changes.body.trim() } : post));
  };

  const createCommunityPost = async (draft) => {
    if (!member) return;
    const post = { kind: draft.kind, title: draft.title.trim(), body: draft.body.trim() };
    if (supabase) {
      await supabase.from("community_posts").insert({ ...post, user_id: member.id });
      await loadRemoteData();
      return;
    }
    setCommunityPosts((current) => [{ ...post, id: `community-${Date.now()}`, userId: member.id, author: member.name, createdAt: new Date().toISOString() }, ...current]);
  };

  const deleteCommunityPost = async (postId) => {
    const post = communityPosts.find((item) => item.id === postId);
    if (!member || (post?.userId !== member.id && admin?.role !== "admin")) return;
    if (supabase) {
      await supabase.from("community_posts").delete().eq("id", postId);
      await loadRemoteData();
      return;
    }
    setCommunityPosts((current) => current.filter((item) => item.id !== postId));
  };

  const toggleCommunitySupport = async (postId, kind) => {
    if (!member) return;
    const post = communityPosts.find((item) => item.id === postId);
    const nextSupported = !post?.supportedByMember;
    if (supabase) {
      if (nextSupported) await supabase.from("community_support").upsert({ post_id: postId, user_id: member.id, kind });
      else await supabase.from("community_support").delete().eq("post_id", postId).eq("user_id", member.id);
      await loadRemoteData();
      return;
    }
    setCommunityPosts((current) => current.map((item) => item.id === postId ? { ...item, supportCount: Math.max(0, (item.supportCount || 0) + (nextSupported ? 1 : -1)), supportedByMember: nextSupported } : item));
  };

  const value = {
    member,
    members,
    admin,
    devotionals,
    mediaPosts,
    communityPosts,
    engagement: memberEngagement,
    memberActivity,
    memberBadges,
    activityLeaderboard,
    activeMembers: activityLeaderboard.filter((profile) => profile.activity.points > 0).length,
    totalMembers: members.length,
    backendConnected: isSupabaseConfigured,
    backendLoading,
    joinCommunity,
    leaveCommunity,
    signInMember,
    signInAdmin,
    signOutAdmin,
    toggleLike,
    markComplete,
    addComment,
    publishDevotional,
    publishMediaPost,
    addMediaComment,
    deleteMediaComment,
    toggleMediaLike,
    deleteMediaPost,
    updateMediaPost,
    createCommunityPost,
    deleteCommunityPost,
    toggleCommunitySupport,
    mediaUpdateNotice,
    clearMediaUpdateNotice: () => setMediaUpdateNotice(""),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

