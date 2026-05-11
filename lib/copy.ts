export const COPY = {
  onboarding: [
    {
      headline: 'This app will pressure you.',
      sub: "That's the point.",
    },
    {
      headline: '5 outreach messages.',
      sub: 'Every. Single. Day.',
    },
    {
      headline: 'January 2027.',
      sub: 'You either got there or you didn\'t.',
    },
  ],

  taskComplete: [
    'Done. Next.',
    "That's how it's done.",
    'One more step.',
    'Keep moving.',
    'No stopping now.',
  ],

  taskWhy: {
    outreach: 'Your first client needs 30–40 touches. You can\'t get there without sending today.',
    log_replies: 'Replies die in inboxes. Log it now before it goes cold.',
    follow_up: 'Most deals close on follow-up 5–8. Not the first message.',
    linkedin: 'Every post is a signal that your company is alive. Stay visible.',
    update_tracker: 'What you don\'t measure disappears. Update it.',
  },

  taskLabels: {
    outreach: 'Send 5 outreach messages today',
    log_replies: 'Log any replies / conversations',
    follow_up: 'Follow up on open leads',
    linkedin: 'Post or engage on LinkedIn (1×)',
    update_tracker: 'Update pipeline tracker',
  },

  streakMessages: {
    zero: 'No streak yet. Start today.',
    low: (n: number) => `Streak: ${n} days. Don\'t be the founder who almost made it.`,
    mid: (n: number) => `${n} days straight. You\'re building something real.`,
    high: (n: number) => `${n} days. Unstoppable. Don\'t break it now.`,
  },

  daysLeft: (n: number) =>
    `${n} days to January. Every day you don\'t reach out is a day your competition does.`,

  contacts: (n: number) =>
    `You\'ve contacted ${n} people. Your first client needs 30–40 touches. Keep going.`,

  status: {
    onTrack: 'ON TRACK',
    fallingBehind: 'FALLING BEHIND',
    paused: 'PAUSED',
  },

  momentum: {
    perfect: 'Unstoppable.',
    solid: 'Solid. Don\'t slip.',
    inconsistent: 'Inconsistent. Pick it up.',
    failing: 'This is how companies fail. Fix it.',
  },

  notifications: {
    morning: (day: number, n: number) =>
      `Day ${day}. ${n} days to Jan 2027. Have you sent your 5 messages yet?`,
    evening: (n: number) =>
      `You haven\'t finished today. ${n} days left. Don\'t waste this one.`,
    streak7: 'Week streak. You\'re consistent. Keep it.',
    streak14: '14 days straight. This is discipline.',
    streak30: '30 day streak. You\'re the founder you said you\'d be.',
  },

  pauseReasons: {
    new_client: 'New client onboarding',
    project_delivery: 'Project delivery sprint',
    travel: 'Travel / conference',
    other: 'Other',
  },
}
