"use client";

import { useEffect, useState } from "react";

type DeadlineCountdownProps = {
  closeAt: string; // ISO date string
  compact?: boolean;
};

function getTimeLeft(
  closeAt: Date
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  closed: boolean;
} {
  const now = new Date();
  const end = new Date(closeAt);
  if (end <= now) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, closed: true };
  }
  const diff = end.getTime() - now.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);
  return { days, hours, minutes, seconds, closed: false };
}

export function DeadlineCountdown({
  closeAt,
  compact = false,
}: DeadlineCountdownProps) {
  const [left, setLeft] = useState(() => getTimeLeft(new Date(closeAt)));

  useEffect(() => {
    const interval = setInterval(() => {
      setLeft(getTimeLeft(new Date(closeAt)));
    }, 1000); // update every second
    return () => clearInterval(interval);
  }, [closeAt]);

  if (left.closed) {
    return (
      <p className="text-muted-foreground text-sm">
        Applications for this session have closed.
      </p>
    );
  }

  if (compact) {
    return (
      <p className="text-sm font-medium tabular-nums">
        {left.days}d {left.hours}h {left.minutes}m {left.seconds}s left
      </p>
    );
  }

  const cells = [
    { value: left.days, label: "Days" },
    { value: left.hours, label: "Hours" },
    { value: left.minutes, label: "Minutes" },
    { value: left.seconds, label: "Seconds" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Application deadline</p>
      <div className="grid grid-cols-4 gap-3 max-w-md">
        {cells.map(({ value, label }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card px-3 py-2 text-center"
          >
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
