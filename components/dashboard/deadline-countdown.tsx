"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock } from "lucide-react";

const FLASH_INTERVAL_MS = 500;

type DeadlineCountdownProps = {
  closeAt: string;
  compact?: boolean;
  inverse?: boolean;
};

function getTimeLeft(closeAt: Date) {
  const now = new Date();
  const end = new Date(closeAt);
  if (end <= now) return { days: 0, hours: 0, minutes: 0, seconds: 0, closed: true };
  const diff = end.getTime() - now.getTime();
  return {
    days: Math.floor(diff / (24 * 60 * 60 * 1000)),
    hours: Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
    minutes: Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000)),
    seconds: Math.floor((diff % (60 * 1000)) / 1000),
    closed: false,
  };
}

export function DeadlineCountdown({
  closeAt,
  compact = false,
  inverse = false,
}: DeadlineCountdownProps) {
  const [left, setLeft] = useState(() => getTimeLeft(new Date(closeAt)));
  const [flashVisible, setFlashVisible] = useState(true);

  const isAlertMode = left.closed || left.days <= 3;

  useEffect(() => {
    const interval = setInterval(
      () => setLeft(getTimeLeft(new Date(closeAt))),
      1000
    );
    return () => clearInterval(interval);
  }, [closeAt]);

  useEffect(() => {
    if (!isAlertMode) return;
    const t = setInterval(() => setFlashVisible((v) => !v), FLASH_INTERVAL_MS);
    return () => clearInterval(t);
  }, [isAlertMode]);

  if (left.closed) {
    return (
      <p
        className={`flex items-center gap-2 text-sm font-medium text-red-600 transition-opacity duration-75 ${
          isAlertMode && !flashVisible ? "opacity-0" : "opacity-100"
        } ${inverse ? "text-red-300" : ""}`}
      >
        <Clock className="size-4 shrink-0" />
        Applications for this session have closed.
      </p>
    );
  }

  if (compact) {
    return (
      <div className={`text-sm ${inverse ? "text-white/90" : ""}`}>
        <span className={`text-xs font-semibold uppercase tracking-wider ${inverse ? "text-white/55" : "text-muted-foreground"}`}>
          Deadline in
        </span>
        <p
          className={`mt-1 font-heading text-2xl font-semibold transition-opacity duration-75 ${
            isAlertMode && !flashVisible ? "opacity-0" : "opacity-100"
          } ${isAlertMode ? (inverse ? "text-red-300" : "text-red-600") : inverse ? "text-white" : "text-foreground"}`}
        >
          {left.days}d {left.hours}h {left.minutes}m {left.seconds}s
         </p>
      </div>
    );
  }

  const urgent = left.days <= 3;
  const soon = left.days <= 7 && !urgent;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Application deadline
          </p>
          <h3 className="mt-0.5 font-heading text-lg font-semibold text-foreground">
            Enrollment closes soon
          </h3>
        </div>
        {urgent && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
            <AlertCircle className="size-3.5" />
            Urgent
          </span>
        )}
        {soon && !urgent && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
            <Clock className="size-3.5" />
            Closing soon
          </span>
        )}
      </div>

      <div
        className={`grid grid-cols-4 gap-3 transition-opacity duration-75 ${
          isAlertMode && !flashVisible ? "opacity-0" : "opacity-100"
        }`}
      >
        {[
          { value: left.days, label: "Days" },
          { value: left.hours, label: "Hours" },
          { value: left.minutes, label: "Minutes" },
          { value: left.seconds, label: "Seconds" },
        ].map(({ value, label }) => (
          <div
            key={label}
            className={`rounded-xl border p-4 text-center ${
              urgent
                ? "border-red-200 bg-red-50"
                : soon
                ? "border-amber-100 bg-amber-50"
                : "border-primary/15 bg-primary/5"
            }`}
          >
            <p
              className={`font-heading text-3xl font-semibold ${
                urgent
                  ? "text-red-600"
                  : soon
                  ? "text-amber-700"
                  : "text-foreground"
              }`}
            >
              {String(value).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
