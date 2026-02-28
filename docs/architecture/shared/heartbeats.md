# Heartbeat Patterns

> Shared reference for proactive heartbeat behavior

## When to Use Heartbeats

- Multiple checks can batch together (inbox + calendar + notifications)
- You need conversational context from recent messages
- Timing can drift slightly (~30 min is fine)

## When to Use Cron

- Exact timing matters ("9:00 AM sharp every Monday")
- Task needs isolation from main session history
- One-shot reminders ("remind me in 20 minutes")

## Default Heartbeat Checklist

```markdown
Read HEARTBEAT.md if it exists. Follow it strictly.
Do not infer or repeat old tasks from prior chats.
If nothing needs attention, reply HEARTBEAT_OK.
```

## Things to Check (rotate 2-4x/day)

- **Emails** — Any urgent unread messages?
- **Calendar** — Upcoming events in next 24-48h?
- **Mentions** — Twitter/social notifications?
- **Weather** — Relevant if human might go out?

## When to Reach Out

- Important email arrived
- Calendar event coming up (<2h)
- Something interesting found
- It's been >8h since last message

## When to Stay Quiet (HEARTBEAT_OK)

- Late night (23:00-08:00) unless urgent
- Human is clearly busy
- Nothing new since last check
- You just checked <30 minutes ago
