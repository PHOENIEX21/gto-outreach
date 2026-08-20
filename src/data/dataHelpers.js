import { useCallback, useState } from "react";

export const starterDevotionals = [
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

export const starterMediaPosts = [];
export const starterCommunityPosts = [];

export function readStorage(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function useStoredState(key, fallback) {
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

export function summarizeActivity(activity = {}, mediaActivity = {}, communityActivity = {}) {
  const completed = activity.completed || [];
  const liked = activity.liked || [];
  const comments = activity.comments || [];
  const mediaLiked = mediaActivity.liked || 0;
  const mediaComments = mediaActivity.comments || 0;
  const communityPosts = communityActivity.posts || 0;
  const communitySupport = communityActivity.support || 0;
  const shares = mediaActivity.shares || communityActivity.shares || 0;
  const points = completed.length * 10 + liked.length * 3 + comments.length * 5 + mediaLiked * 3 + mediaComments * 5 + communityPosts * 5 + communitySupport * 3 + shares * 2;
  const grade = points >= 100 ? "A+" : points >= 70 ? "A" : points >= 40 ? "B" : points >= 15 ? "C" : points > 0 ? "D" : "-";
  const label = points >= 70 ? "Highly active" : points >= 40 ? "Active" : points > 0 ? "Growing" : "Getting started";
  return {
    points,
    grade,
    label,
    completed: completed.length,
    liked: liked.length + mediaLiked,
    comments: comments.length + mediaComments,
    communityPosts,
    communitySupport,
    shares,
    engagements: completed.length + liked.length + comments.length + mediaLiked + mediaComments + communityPosts + communitySupport + shares,
  };
}

export function debounce(fn, wait = 400) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  return debounced;
}