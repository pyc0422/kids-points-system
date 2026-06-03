import {
  ActivityIcon,
  BadgeDollarSign,
  CalendarDays,
  HomeIcon,
} from "lucide-react";
import type { TabId } from "./app-types";

export const roleLabels = {
  admin: "Admin",
  parent: "Parent",
  kid: "Kid",
};

export const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: "home", label: "Home", icon: <HomeIcon aria-hidden className="size-5 sm:size-4" /> },
  {
    id: "activities",
    label: "Activities",
    icon: <ActivityIcon aria-hidden className="size-5 sm:size-4" />,
  },
  {
    id: "balances",
    label: "Balances",
    icon: <BadgeDollarSign aria-hidden className="size-5 sm:size-4" />,
  },
  {
    id: "charts",
    label: "Charts",
    icon: <CalendarDays aria-hidden className="size-5 sm:size-4" />,
  },
];

export const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const demoToday = new Date("2026-05-26T12:00:00");
