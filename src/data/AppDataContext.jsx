import { useCallback, useEffect, useRef, useState } from "react";
import { AppDataContext } from "./AppDataContextValue";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { starterDevotionals, starterMediaPosts, starterCommunityPosts, useStoredState, summarizeActivity, debounce } from "./dataHelpers";

export function AppDataProvider({ children }) {
  const [member, setMember] = useStoredState("gto-member-v2", null);
  const [members, setMembers] = useStoredState("gto-members-v2", []);
  const [admin, setAdmin] = useStoredState("gto-admin-v2", null);
  const [devotionals, setDevotionals] = useStoredState("gto-devotionals-v2", starterDevotionals);
  const [mediaPosts, setMediaPosts] = useStoredState("gto-media-posts-v1", starterMediaPosts);
  const [communityPosts, setCommunityPosts] = useStoredState("gto-community-posts-v1", starterCommunityPosts);
  const [engagement, setEngagement] = useStoredState("gto-engagement-v2", {});
  const [shares, setShares] = useStoredState("gto-shares-v1", {});
  const [readingProgress, setReadingProgress] = useStoredState("gto-reading-progress-v1", {});
  const [notifications, setNotifications] = useStoredState("gto-notifications-v1", []);
  const [theme, setTheme] = useStoredState("gto-theme-v1", "light");
  const [backendLoading, setBackendLoading] = useState(isSupabaseConfigured);
  const [backendError, setBackendError] = useState("");
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [mediaUpdateNotice, setMediaUpdateNotice] = useState("");
  const remoteActions = useRef({});
  const scheduleReloadRef = useRef(null);
  if (!scheduleReloadRef.current) scheduleReloadRef.current = debounce(() => remoteActions.current.loadRemoteData(), 400);

  const memberEngagement = member ? (engagement[member.id] || { completed: [], liked: [], comments: [] }) : { completed: [], liked: [], comments: [] };
  const memberReadingProgress = member ? (readingProgress[member.id] || {}) : {};
  const memberReadingHistory = devotionals
    .filter((item) => memberReadingProgress[item.id])
    .map((item) => ({ ...item, reading: memberReadingProgress[item.id] }))
    .sort((first, second) => new Date(second.reading.updatedAt) - new Date(first.reading.updatedAt));
  const readingDates = new Set(Object.values(memberReadingProgress).filter((item) => item.updatedAt).map((item) => new Date(item.updatedAt).toISOString().slice(0, 10)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const streakCursor = readingDates.has(today.toISOString().slice(0, 10)) ? today : yesterday;
  let readingStreak = 0;
  while (readingDates.has(streakCursor.toISOString().slice(0, 10))) {
    readingStreak += 1;
    streakCursor.setDate(streakCursor.getDate() - 1);
  }
  const memberMediaActivity = {
    liked: mediaPosts.filter((post) => post.likedByMember).length,
    comments: mediaPosts.reduce((total, post) => total + (post.comments || []).filter((comment) => comment.userId === member?.id).length, 0),
  };
  const memberCommunityActivity = {
    posts: communityPosts.filter((post) => post.userId === member?.id).length,
    support: communityPosts.filter((post) => post.supportedByMember).length,
    shares: (shares[member?.id] || []).length,
  };
  const devotionalComments = Object.values(engagement)
    .flatMap((activity) => activity.comments || [])
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
  const memberActivity = summarizeActivity(memberEngagement, memberMediaActivity, memberCommunityActivity);
  const memberBadges = [
    memberActivity.completed >= 1 && { icon: "✦", name: "First step", detail: "Completed a devotional" },
    memberActivity.completed >= 3 && { icon: "☼", name: "Word walker", detail: "Completed three devotionals" },
    memberActivity.liked >= 3 && { icon: "♡", name: "Word keeper", detail: "Saved three words" },
    memberActivity.comments >= 1 && { icon: "✎", name: "Encourager", detail: "Shared encouragement" },
    communityPosts.some((post) => post.supportedByMember) && { icon: "♥", name: "Standing with you", detail: "Supported the community" },
  ].filter(Boolean);
  const memberNotifications = notifications
    .filter((notification) => notification.userId === member?.id)
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
  const unreadNotifications = memberNotifications.filter((notification) => !notification.read).length;
  const activityLeaderboard = members
    .filter((profile) => profile.role !== "admin")
    .map((profile) => {
      const mediaActivity = {
        liked: mediaPosts.reduce((total, post) => total + ((post.likedUserIds || []).includes(profile.id) ? 1 : 0), 0),
        comments: mediaPosts.reduce((total, post) => total + (post.comments || []).filter((comment) => comment.userId === profile.id).length, 0),
      };
      const communityActivity = {
        posts: communityPosts.filter((post) => post.userId === profile.id).length,
        support: communityPosts.filter((post) => (post.supportedUserIds || []).includes(profile.id)).length,
        shares: (shares[profile.id] || []).length,
      };
      return { ...profile, activity: summarizeActivity(engagement[profile.id], mediaActivity, communityActivity) };
    })
    .sort((first, second) => second.activity.points - first.activity.points);

  const applyRemoteSession = async (session) => {
    if (!session?.user || !supabase) {
      setMember(null);
      setAdmin(null);
      return;
    }
    let { data: profile, error: profileError } = await supabase.from("profiles").select("id, full_name, role, avatar_url, created_at").eq("id", session.user.id).single();
    if (profileError?.message?.includes("avatar_url")) {
      const fallback = await supabase.from("profiles").select("id, full_name, role, created_at").eq("id", session.user.id).single();
      profile = fallback.data;
      profileError = fallback.error;
    }
    if (profileError) {
      setBackendError(profileError.message);
      setMember(null);
      setAdmin(null);
      return;
    }
    if (profile) {
      setMember({ id: profile.id, name: profile.full_name, email: session.user.email, avatarUrl: profile.avatar_url, joinedAt: profile.created_at, role: profile.role });
      if (profile.role === "admin") setAdmin({ id: profile.id, name: profile.full_name, email: session.user.email, role: "admin" });
      else setAdmin(null);
    } else {
      setMember(null);
      setAdmin(null);
    }
  };

  const loadRemoteData = async () => {
    if (!supabase) return;
    let { data: remoteProfiles, error: profilesError } = await supabase.from("profiles").select("id, full_name, role, avatar_url, created_at").order("created_at", { ascending: false });
    if (profilesError?.message?.includes("avatar_url")) {
      const fallback = await supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false });
      remoteProfiles = fallback.data;
      profilesError = fallback.error;
    }
    if (profilesError) setBackendError(profilesError.message);
    const { data: remoteDevotionals } = await supabase.from("devotionals").select("id, title, reference, scripture, reflection, prayer, published_at").order("published_at", { ascending: false });
    const { data: remoteMediaPosts } = await supabase.from("media_posts").select("id, kind, title, body, media_url, published_at, published_by, profiles(full_name)").order("published_at", { ascending: false });
    const { data: remoteMediaComments } = await supabase.from("media_comments").select("id, media_post_id, user_id, body, created_at, profiles(full_name, avatar_url)").order("created_at", { ascending: false });
    const { data: remoteMediaReactions } = await supabase.from("media_reactions").select("media_post_id, user_id, liked");
    const { data: remoteCommunityPosts } = await supabase.from("community_posts").select("id, kind, title, body, user_id, created_at, profiles(full_name)").order("created_at", { ascending: false });
    const { data: remoteCommunitySupport } = await supabase.from("community_support").select("post_id, user_id, kind");
    const { data: remoteCommunityComments } = await supabase.from("community_comments").select("id, post_id, user_id, body, created_at, profiles(full_name, avatar_url)").order("created_at", { ascending: true });
    const { data: remoteShares } = await supabase.from("content_shares").select("user_id, content_type, content_id");
    const { data: remoteNotifications } = await supabase.from("notifications").select("id, user_id, type, title, body, link, read, created_at").order("created_at", { ascending: false }).limit(100);
    const { data: remoteProgress } = await supabase.from("devotional_progress").select("user_id, devotional_id, progress, scroll_ratio, updated_at");
    if (remoteShares) {
      const nextShares = {};
      remoteShares.forEach((share) => {
        nextShares[share.user_id] = [...(nextShares[share.user_id] || []), `${share.content_type}:${share.content_id}`];
      });
      setShares(nextShares);
    }
    if (remoteNotifications) {
      setNotifications(remoteNotifications.map((notification) => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        link: notification.link,
        read: notification.read,
        createdAt: notification.created_at,
      })));
    }
    if (remoteProgress) {
      const nextProgress = {};
      remoteProgress.forEach((item) => {
        nextProgress[item.user_id] = {
          ...(nextProgress[item.user_id] || {}),
          [item.devotional_id]: { progress: item.progress, scrollRatio: Number(item.scroll_ratio), updatedAt: item.updated_at },
        };
      });
      setReadingProgress(nextProgress);
    }
    if (remoteProfiles) {
      setMembers(remoteProfiles.map((profile) => ({
        id: profile.id,
        name: profile.full_name,
        avatarUrl: profile.avatar_url || null,
        email: "",
        joinedAt: profile.created_at,
        role: profile.role,
      })));
    }
    if (remoteDevotionals) {
      const { data: remoteEngagement } = await supabase.from("devotional_engagement").select("devotional_id, user_id, liked, completed");
      const { data: remoteComments } = await supabase.from("devotional_comments").select("id, devotional_id, user_id, body, created_at, profiles(full_name, avatar_url)").order("created_at", { ascending: false });
      const nextEngagement = {};
      (remoteEngagement || []).forEach((item) => {
        const current = nextEngagement[item.user_id] || { completed: [], liked: [], comments: [] };
        if (item.liked) current.liked.push(item.devotional_id);
        if (item.completed) current.completed.push(item.devotional_id);
        nextEngagement[item.user_id] = current;
      });
      (remoteComments || []).forEach((item) => {
        const current = nextEngagement[item.user_id] || { completed: [], liked: [], comments: [] };
        current.comments.push({ id: item.id, userId: item.user_id, devotionalId: item.devotional_id, author: item.profiles?.full_name || "Member", authorAvatar: item.profiles?.avatar_url || null, text: item.body, createdAt: item.created_at });
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
        publishedBy: item.published_by,
        author: item.profiles?.full_name || "Member",
        comments: (remoteMediaComments || []).filter((comment) => comment.media_post_id === item.id).map((comment) => ({ id: comment.id, userId: comment.user_id, author: comment.profiles?.full_name || "Member", authorAvatar: comment.profiles?.avatar_url || null, text: comment.body, createdAt: comment.created_at })),
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
        author: post.profiles?.full_name || "Member",
        createdAt: post.created_at,
        supportCount: (remoteCommunitySupport || []).filter((support) => support.post_id === post.id).length,
        supportedUserIds: (remoteCommunitySupport || []).filter((support) => support.post_id === post.id).map((support) => support.user_id),
        supportedByMember: (remoteCommunitySupport || []).some((support) => support.post_id === post.id && support.user_id === member?.id),
        comments: (remoteCommunityComments || []).filter((comment) => comment.post_id === post.id).map((comment) => ({ id: comment.id, userId: comment.user_id, author: comment.profiles?.full_name || "Member", authorAvatar: comment.profiles?.avatar_url || null, text: comment.body, createdAt: comment.created_at })),
      })));
    }
  };

  remoteActions.current = { applyRemoteSession, loadRemoteData };

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    if (window.location.hash.includes("type=recovery") || new URLSearchParams(window.location.search).has("code")) {
      setPasswordRecovery(true);
    }
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
        setPasswordRecovery(false);
      } else if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        if (session) remoteActions.current.applyRemoteSession(session);
      } else if (session) {
        remoteActions.current.applyRemoteSession(session);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
      scheduleReloadRef.current.cancel();
    };
  }, [setMember, setAdmin]);

  useEffect(() => {
    if (!supabase) return undefined;
    const channel = supabase
      .channel("gto-live-media")
      .on("postgres_changes", { event: "*", schema: "public", table: "media_posts" }, (payload) => {
        if (payload.eventType === "INSERT") setMediaUpdateNotice("New GTO update just arrived.");
        scheduleReloadRef.current();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "media_comments" }, () => scheduleReloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "media_reactions" }, () => scheduleReloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => scheduleReloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_support" }, () => scheduleReloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "devotional_engagement" }, () => scheduleReloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "devotional_comments" }, () => scheduleReloadRef.current())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => scheduleReloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "devotional_progress" }, () => scheduleReloadRef.current())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      scheduleReloadRef.current.cancel();
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

  const pushNotification = (userId, notification) => {
    if (!userId || userId === member?.id) return;
    setNotifications((current) => [{
      id: `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId,
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    }, ...current].slice(0, 100));
  };

  const recordShare = async (contentType, contentId, title, link) => {
    if (!member) return { success: true, alreadyRecorded: true };
    const shareKey = `${contentType}:${contentId}`;
    if ((shares[member.id] || []).includes(shareKey)) return { success: true, alreadyRecorded: true };
    if (supabase) {
      const { error } = await supabase.from("content_shares").insert({ user_id: member.id, content_type: contentType, content_id: contentId });
      if (error && error.code !== "23505") return { success: false, error: error.message };
    }
    setShares((current) => ({ ...current, [member.id]: [...(current[member.id] || []), shareKey] }));
    return { success: true, title, link };
  };

  const updateReadingProgress = useCallback(async (devotionalId, progress, scrollRatio = progress) => {
    if (!member || !devotionalId) return;
    const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress)));
    const normalizedRatio = Math.max(0, Math.min(1, scrollRatio));
    if (supabase) {
      await supabase.from("devotional_progress").upsert({ user_id: member.id, devotional_id: devotionalId, progress: normalizedProgress, scroll_ratio: normalizedRatio, updated_at: new Date().toISOString() });
    }
    setReadingProgress((current) => ({
      ...current,
      [member.id]: {
        ...(current[member.id] || {}),
        [devotionalId]: {
          progress: normalizedProgress,
          scrollRatio: normalizedRatio,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  }, [member, setReadingProgress]);

  const markNotificationRead = async (notificationId) => {
    setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, read: true } : notification));
    if (supabase && !notificationId.startsWith("notification-")) await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
  };

  const markAllNotificationsRead = async () => {
    setNotifications((current) => current.map((notification) => notification.userId === member?.id ? { ...notification, read: true } : notification));
    if (supabase && member) await supabase.from("notifications").update({ read: true }).eq("user_id", member.id).eq("read", false);
  };

  const leaveCommunity = () => setMember(null);

  const signOutMember = async () => {
    if (supabase) await supabase.auth.signOut();
    setMember(null);
  };

  const updateMemberProfile = async ({ name, file }) => {
    if (!member || !name.trim()) return { success: false, error: "Enter a name for your profile." };
    const trimmedName = name.trim();
    if (supabase) {
      let avatarUrl = member.avatarUrl || null;
      if (file) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${member.id}/avatar.${extension}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { contentType: file.type, upsert: true });
        if (uploadError) return { success: false, error: uploadError.message };
        avatarUrl = `${supabase.storage.from("avatars").getPublicUrl(filePath).data.publicUrl}?v=${Date.now()}`;
      }
      const { error } = await supabase.from("profiles").update({ full_name: trimmedName, avatar_url: avatarUrl }).eq("id", member.id);
      if (error) return { success: false, error: error.message };
      setMember((current) => ({ ...current, name: trimmedName, avatarUrl }));
      return { success: true };
    }
    let avatarUrl = member.avatarUrl || null;
    if (file) avatarUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read that image."));
      reader.readAsDataURL(file);
    });
    const nextMember = { ...member, name: trimmedName, avatarUrl };
    setMember(nextMember);
    setMembers((current) => current.map((profile) => profile.id === member.id ? { ...profile, name: trimmedName, avatarUrl } : profile));
    return { success: true };
  };
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
    // Admin sign-in requires a configured Supabase backend. There is intentionally
    // no hardcoded credential fallback here for security.
    return { success: false, error: "Admin sign-in requires a configured Supabase backend." };
  };

  const sendPasswordRecovery = async (email) => {
    if (!supabase) return { success: false, error: "Password recovery requires Supabase." };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? { success: false, error: error.message } : { success: true };
  };

  const updatePassword = async (password) => {
    if (!supabase) return { success: false, error: "Password recovery requires Supabase." };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    setPasswordRecovery(false);
    return { success: true };
  };

  const toggleLike = async (devotionalId) => {
    if (!member) return;
    if (supabase) {
      const current = memberEngagement.liked.includes(devotionalId);
      const { error } = await supabase.from("devotional_engagement").upsert({ devotional_id: devotionalId, user_id: member.id, liked: !current, completed: memberEngagement.completed.includes(devotionalId) });
      if (error) {
        setBackendError(error.message);
        return;
      }
      await loadRemoteData();
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

  const markComplete = async (devotionalId) => {
    if (!member || memberEngagement.completed.includes(devotionalId)) return;
    if (supabase) {
      const { error } = await supabase.from("devotional_engagement").upsert({ devotional_id: devotionalId, user_id: member.id, liked: memberEngagement.liked.includes(devotionalId), completed: true });
      if (error) {
        setBackendError(error.message);
        return;
      }
      await loadRemoteData();
      return;
    }
    setEngagement((current) => ({ ...current, [member.id]: { ...memberEngagement, completed: [...memberEngagement.completed, devotionalId] } }));
    setDevotionals((current) => current.map((item) => (
      item.id === devotionalId ? { ...item, completions: item.completions + 1 } : item
    )));
  };

  const addComment = async (devotionalId, text) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;
    if (!member) return;
    if (supabase) {
      const { error } = await supabase.from("devotional_comments").insert({ devotional_id: devotionalId, user_id: member.id, body: trimmedText });
      if (error) {
        setBackendError(error.message);
        return;
      }
      await loadRemoteData();
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
          userId: member.id,
          devotionalId,
          author: member?.name || "Member",
          authorAvatar: member?.avatarUrl || null,
          text: trimmedText,
          createdAt: new Date().toISOString(),
          },
        ],
      },
    }));
    devotionalComments.filter((item) => item.devotionalId === devotionalId && item.userId && item.userId !== member.id).forEach((item) => pushNotification(item.userId, { type: "reply", title: member.name, body: "replied in the devotional conversation.", link: `/devotional?id=${devotionalId}` }));
    setDevotionals((current) => current.map((item) => (
      item.id === devotionalId ? { ...item, comments: item.comments + 1 } : item
    )));
  };

  const publishDevotional = async (draft) => {
    if (supabase && admin) {
      const { error } = await supabase.from("devotionals").insert({ title: draft.title, reference: draft.reference, scripture: draft.scripture, reflection: draft.reflection, prayer: draft.prayer, published_by: admin.id });
      if (error) {
        setBackendError(error.message);
        return { success: false, error: error.message };
      }
      await loadRemoteData();
      return { success: true };
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
    return { success: true };
  };

  const updateDevotional = async (devotionalId, changes) => {
    if (!admin) return;
    if (supabase) {
      const { error } = await supabase.from("devotionals").update({ title: changes.title.trim(), reference: changes.reference.trim(), scripture: changes.scripture.trim(), reflection: changes.reflection.trim(), prayer: changes.prayer.trim() }).eq("id", devotionalId);
      if (!error) await loadRemoteData();
      return;
    }
    setDevotionals((current) => current.map((item) => item.id === devotionalId ? {
      ...item,
      title: changes.title.trim(),
      reference: changes.reference.trim(),
      scripture: changes.scripture.trim(),
      reflection: changes.reflection.trim(),
      prayer: changes.prayer.trim(),
    } : item));
  };

  const deleteDevotional = async (devotionalId) => {
    if (!admin) return;
    if (supabase) {
      const { error } = await supabase.from("devotionals").delete().eq("id", devotionalId);
      if (error) throw error;
      await loadRemoteData();
      return;
    }
    setDevotionals((current) => current.filter((item) => item.id !== devotionalId));
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
      publishedBy: admin?.id,
    };
    if (supabase && admin) {
      const { error } = await supabase.from("media_posts").insert({ kind: post.kind, title: post.title, body: post.body, media_url: post.mediaUrl || null, published_by: admin.id });
      if (error) throw error;
      await loadRemoteData();
      return;
    }
    setMediaPosts((current) => [{ ...post, id: `media-${Date.now()}`, author: "Staff" }, ...current]);
    members.filter((profile) => profile.id !== admin?.id).forEach((profile) => pushNotification(profile.id, { type: "update", title: "New from GTO", body: post.title, link: "/media" }));
  };

  const addMediaComment = async (mediaPostId, text) => {
    const trimmedText = text.trim();
    if (!member || !trimmedText) return;
    const post = mediaPosts.find((item) => item.id === mediaPostId);
    if (supabase) {
      const { error } = await supabase.from("media_comments").insert({ media_post_id: mediaPostId, user_id: member.id, body: trimmedText });
      if (!error) await loadRemoteData();
      return;
    }
    if (post?.publishedBy) pushNotification(post.publishedBy, { type: "reply", title: member.name, body: `replied to "${post.title}".`, link: `/media#media-${mediaPostId}` });
    setMediaPosts((current) => current.map((post) => post.id === mediaPostId ? {
      ...post,
      comments: [...(post.comments || []), { id: `media-comment-${Date.now()}`, userId: member.id, author: member.name, authorAvatar: member.avatarUrl || null, text: trimmedText, createdAt: new Date().toISOString() }],
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
    if (nextLiked && post?.publishedBy) pushNotification(post.publishedBy, { type: "like", title: member.name, body: `liked "${post.title}".`, link: `/media#media-${mediaPostId}` });
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
      const { error } = await supabase.from("community_posts").insert({ ...post, user_id: member.id });
      if (error) throw error;
      await loadRemoteData();
      return;
    }
    setCommunityPosts((current) => [{ ...post, id: `community-${Date.now()}`, userId: member.id, author: member.name, createdAt: new Date().toISOString(), supportedUserIds: [], comments: [] }, ...current]);
  };

  const addCommunityComment = async (postId, text) => {
    const trimmedText = text.trim();
    if (!member || !trimmedText) return { success: false, error: "Write an encouragement first." };
    const post = communityPosts.find((item) => item.id === postId);
    if (supabase) {
      const { error } = await supabase.from("community_comments").insert({ post_id: postId, user_id: member.id, body: trimmedText });
      if (error) return { success: false, error: error.message };
      await loadRemoteData();
      return { success: true };
    }
    if (post?.userId) pushNotification(post.userId, { type: "reply", title: member.name, body: `replied to "${post.title}".`, link: `/community-wall#community-${postId}` });
    setCommunityPosts((current) => current.map((item) => item.id === postId ? { ...item, comments: [...(item.comments || []), { id: `community-comment-${Date.now()}`, userId: member.id, author: member.name, authorAvatar: member.avatarUrl || null, text: trimmedText, createdAt: new Date().toISOString() }] } : item));
    return { success: true };
  };

  const deleteCommunityPost = async (postId) => {
    const post = communityPosts.find((item) => item.id === postId);
    if (!member || (post?.userId !== member.id && admin?.role !== "admin")) return;
    if (supabase) {
      const { error } = await supabase.from("community_posts").delete().eq("id", postId);
      if (error) {
        setBackendError(error.message);
        return;
      }
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
      const result = nextSupported
        ? await supabase.from("community_support").upsert({ post_id: postId, user_id: member.id, kind })
        : await supabase.from("community_support").delete().eq("post_id", postId).eq("user_id", member.id);
      if (result.error) {
        setBackendError(result.error.message);
        return;
      }
      await loadRemoteData();
      return;
    }
    if (nextSupported && post?.userId) pushNotification(post.userId, {
      type: "prayer",
      title: member.name,
      body: post.kind === "prayer" ? "is praying with you." : "said Amen to your testimony.",
      link: `/community-wall#community-${postId}`,
    });
    setCommunityPosts((current) => current.map((item) => item.id === postId ? {
      ...item,
      supportCount: Math.max(0, (item.supportCount || 0) + (nextSupported ? 1 : -1)),
      supportedByMember: nextSupported,
      supportedUserIds: nextSupported ? [...(item.supportedUserIds || []), member.id] : (item.supportedUserIds || []).filter((id) => id !== member.id),
    } : item));
  };

  const analytics = {
    devotionalComments: devotionalComments.length,
    devotionalLikes: Object.values(engagement).reduce((total, activity) => total + (activity.liked || []).length, 0),
    completedReadings: Object.values(engagement).reduce((total, activity) => total + (activity.completed || []).length, 0),
    mediaLikes: mediaPosts.reduce((total, post) => total + (post.likedUserIds || []).length, 0),
    mediaComments: mediaPosts.reduce((total, post) => total + (post.comments || []).length, 0),
    communityComments: communityPosts.reduce((total, post) => total + (post.comments || []).length, 0),
    communitySupport: communityPosts.reduce((total, post) => total + (post.supportedUserIds || []).length, 0),
    shares: Object.values(shares).reduce((total, memberShares) => total + memberShares.length, 0),
  };

      const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value = {
    member,
    members,
    admin,
    devotionals,
    mediaPosts,
    communityPosts,
    engagement: memberEngagement,
    readingProgress: memberReadingProgress,
    readingHistory: memberReadingHistory,
    readingStreak,
    devotionalComments,
    memberActivity,
    memberBadges,
    analytics,
    activityLeaderboard,
    activeMembers: activityLeaderboard.filter((profile) => profile.activity.points > 0).length,
    totalMembers: members.length,
        backendConnected: isSupabaseConfigured,
    backendLoading,
    backendError,
    clearBackendError: () => setBackendError(""),
    theme,
    toggleTheme,
    passwordRecovery,
    joinCommunity,
    leaveCommunity,
    signOutMember,
    updateMemberProfile,
    memberNotifications,
    unreadNotifications,
    recordShare,
    updateReadingProgress,
    markNotificationRead,
    markAllNotificationsRead,
    signInMember,
    signInAdmin,
    sendPasswordRecovery,
    updatePassword,
    signOutAdmin,
    toggleLike,
    markComplete,
    addComment,
    publishDevotional,
    updateDevotional,
    deleteDevotional,
    publishMediaPost,
    addMediaComment,
    deleteMediaComment,
    toggleMediaLike,
    deleteMediaPost,
    updateMediaPost,
    createCommunityPost,
    addCommunityComment,
    deleteCommunityPost,
    toggleCommunitySupport,
    mediaUpdateNotice,
    clearMediaUpdateNotice: () => setMediaUpdateNotice(""),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

