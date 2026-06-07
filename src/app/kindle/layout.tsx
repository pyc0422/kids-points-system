import type { ReactNode } from "react";
import { getKindleSessionHouseId } from "@/lib/kindle/auth";
import { isoDate, parseDateKey } from "@/utils/date";
import { kindleSignOutAction } from "./actions";
import { KindleNav } from "./KindleNav";

function KindleFallbackStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
.kindle-shell {
  background: #fff;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 20px;
  line-height: 1.25;
  min-height: 100vh;
}
.kindle-shell * {
  box-sizing: border-box;
}
.kindle-page {
  margin: 0 auto;
  max-width: 960px;
  padding: 16px;
}
.kindle-header {
  border-bottom: 1px solid #000;
  margin-bottom: 12px;
  padding-bottom: 0;
}
.kindle-header-top {
  display: table;
  width: 100%;
}
.kindle-title-block,
.kindle-lock {
  display: table-cell;
  vertical-align: top;
}
.kindle-lock {
  text-align: right;
}
.kindle-today {
  font-size: 20px;
  font-weight: 900;
}
.kindle-eyebrow {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
}
.kindle-shell h1,
.kindle-shell h2,
.kindle-shell h3,
.kindle-shell p {
  margin-top: 0;
}
.kindle-shell h1 {
  font-size: 42px;
  font-weight: 900;
  margin-bottom: 0;
}
.kindle-shell h2 {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 8px;
}
.kindle-shell h3 {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 10px;
}
.kindle-nav {
  display: table;
  table-layout: fixed;
  width: 430px;
  max-width: 100%;
  border-bottom: 0;
  border-spacing: 0;
  margin: 12px 0 0;
  white-space: nowrap;
}
.kindle-nav-link {
  border: 1px solid #000;
  border-bottom: 0;
  border-left: 0;
  color: #000;
  display: table-cell;
  font-size: 15px;
  font-weight: 900;
  padding: 8px 12px;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  outline: 0;
}
.kindle-nav-link:first-child {
  border-left: 1px solid #000;
}
.kindle-nav-link-active {
  background: #000;
  color: #fff;
}
.kindle-stack > * {
  margin-bottom: 24px;
}
.kindle-dashboard-next {
  border-top: 2px solid #000;
  padding-top: 12px;
}
.kindle-section-head,
.kindle-page-head {
  border-bottom: 2px solid #000;
  margin-bottom: 12px;
  padding-bottom: 8px;
}
.kindle-section-head {
  display: table;
  width: 100%;
}
.kindle-section-head > * {
  display: table-cell;
  vertical-align: bottom;
}
.kindle-section-head > *:last-child {
  text-align: right;
}
.kindle-card,
.kindle-empty {
  border: 2px solid #000;
  margin-bottom: 12px;
  padding: 14px;
}
.kindle-form {
  border: 0;
  border-bottom: 1px solid #000;
  margin-bottom: 12px;
  padding: 0 0 12px;
}
.kindle-next-form {
  display: block;
  width: 100%;
}
.kindle-next-form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  width: 100%;
}
.kindle-next-action-row {
  margin-bottom: 0;
}
.kindle-next-form .kindle-field,
.kindle-next-form .kindle-next-checkbox,
.kindle-next-form .kindle-add-cell {
  margin: 0;
  vertical-align: bottom;
}
.kindle-next-title {
  flex: 1 1 240px;
  min-width: 160px;
}
.kindle-next-date {
  flex: 0 1 260px;
  min-width: 210px;
}
.kindle-next-checkbox {
  font-size: 14px;
  font-weight: 900;
  padding: 0 4px 10px;
  text-transform: uppercase;
  white-space: nowrap;
  flex: 0 0 auto;
}
.kindle-next-checkbox input {
  display: inline-block;
  height: auto;
  margin-right: 4px;
  padding: 0;
  vertical-align: middle;
  width: auto;
}
.kindle-next-checkbox span {
  vertical-align: middle;
}
.kindle-next-form .kindle-add-cell {
  flex: 0 0 96px;
  text-align: right;
}
.kindle-next-form input {
  height: 52px;
  padding: 6px 10px;
}
.kindle-shell .kindle-next-form .kindle-add-button {
  font-size: 15px;
  height: 40px;
  line-height: 1;
  padding: 6px 10px;
  width: 100%;
}
.kindle-shell .kindle-next-form .kindle-add-button {
  width: 96px;
}
.kindle-card-head {
  display: table;
  width: 100%;
}
.kindle-card-head > * {
  display: table-cell;
  vertical-align: middle;
}
.kindle-card-head > *:last-child {
  text-align: right;
}
.kindle-kid-grid {
  display: table;
  table-layout: fixed;
  width: 100%;
  border-spacing: 10px 0;
  margin: 0 -10px 18px;
}
.kindle-kid-card {
  display: table-cell;
  padding: 8px 10px 8px 0;
  vertical-align: top;
}
.kindle-kid-card + .kindle-kid-card {
  border-left: 1px solid #000;
  padding-left: 10px;
}
.kindle-kid-head {
  display: table;
  width: 100%;
  border-bottom: 1px solid #000;
  margin-bottom: 8px;
  padding-bottom: 4px;
}
.kindle-kid-name,
.kindle-due-count {
  display: table-cell;
  vertical-align: baseline;
}
.kindle-kid-name {
  display: table-cell;
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 0;
  padding-bottom: 0;
  vertical-align: baseline;
}
.kindle-due-count {
  border-bottom: 0;
  display: table-cell;
  font-size: 15px;
  font-weight: 900;
  text-align: right;
  margin-bottom: 0;
  padding-bottom: 0;
  vertical-align: baseline;
  white-space: nowrap;
}
.kindle-kid-balance,
.kindle-reminders {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}
.kindle-kid-balance {
  text-align: right;
}
.kindle-reminders {
  line-height: 1.25;
}
.kindle-reminder-list {
  margin: 8px 0 0;
}
.kindle-reminder-row {
  border-top: 1px solid #000;
  font-size: 15px;
  font-weight: 700;
  padding: 5px 0;
}
.kindle-reminder-empty {
  border-top: 1px solid #000;
  font-size: 15px;
  font-weight: 700;
  padding: 5px 0;
}
.kindle-pill,
.kindle-metric {
  border: 0;
  display: inline-block;
  font-weight: 900;
  padding: 0;
}
.kindle-metrics {
  display: table;
  table-layout: fixed;
  width: 100%;
  border-spacing: 8px 0;
  margin: 0 -8px;
}
.kindle-metric {
  display: table-cell;
  font-size: 20px;
}
.kindle-row {
  border-bottom: 1px solid #000;
  display: table;
  font-weight: 700;
  margin-bottom: 0;
  padding: 12px 0;
  width: 100%;
}
.kindle-row-main,
.kindle-row-count,
.kindle-next-delete {
  display: table-cell;
  vertical-align: middle;
}
.kindle-row-title {
  display: block;
  font-size: 22px;
  font-weight: 900;
  margin-bottom: 2px;
}
.kindle-row-date {
  display: block;
  font-size: 14px;
  font-weight: 700;
}
.kindle-row-count {
  text-align: right;
  width: 90px;
}
.kindle-row-number {
  display: block;
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
}
.kindle-row-unit {
  display: block;
  font-size: 14px;
  font-weight: 700;
}
.kindle-next-delete {
  text-align: right;
  padding-left: 14px;
  width: 56px;
}
.kindle-shell .kindle-next-delete button {
  background: #fff;
  color: #000;
  font-size: 22px;
  font-weight: 900;
  height: 32px;
  line-height: 1;
  padding: 0;
  width: 32px;
}
.kindle-row-passed,
.kindle-done {
  text-decoration: line-through;
}
.kindle-task {
  border: 0;
  border-bottom: 1px solid #000;
  display: table;
  margin-bottom: 0;
  padding: 4px 0;
  width: 100%;
}
.kindle-task:first-child {
  border-top: 0;
}
.kindle-task-title {
  font-size: 17px;
  font-weight: 900;
  margin-bottom: 1px;
}
.kindle-task-schedule,
.kindle-label {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}
.kindle-task-main,
.kindle-task-action {
  display: table-cell;
  vertical-align: middle;
}
.kindle-task-action {
  text-align: right;
  width: 92px;
}
.kindle-todo-button {
  font-size: 12px;
  padding: 1px 6px;
}
.kindle-todo-card {
  border: 0;
  margin-bottom: 16px;
  padding: 0;
}
.kindle-todo-card h3 {
  font-size: 18px;
  margin-bottom: 6px;
}
.kindle-todo-list {
  border-top: 0;
}
.kindle-kid-selector {
  border-bottom: 1px solid #000;
  margin-bottom: 10px;
  white-space: nowrap;
}
.kindle-kid-selector-link {
  border-left: 1px solid #000;
  color: #000;
  display: inline-block;
  font-size: 15px;
  font-weight: 900;
  padding: 7px 10px;
  text-decoration: none;
}
.kindle-kid-selector-link:first-child {
  border-left: 0;
}
.kindle-kid-selector-link-active {
  background: #000;
  color: #fff;
}
.kindle-shell button,
.kindle-shell input {
  border: 2px solid #000;
  border-radius: 0;
  font: inherit;
  padding: 12px;
}
.kindle-shell button {
  background: #000;
  color: #fff;
  font-weight: 900;
}
.kindle-shell .kindle-lock button {
  font-size: 15px;
  line-height: 1;
  padding: 8px 12px;
}
.kindle-shell button.kindle-todo-button {
  font-size: 15px;
  line-height: 1;
  padding: 8px 12px;
}
.kindle-shell button:disabled {
  background: #fff;
  color: #000;
}
.kindle-field {
  display: block;
  margin-bottom: 12px;
}
.kindle-field input {
  display: block;
  width: 100%;
}
.kindle-login {
  border: 4px solid #000;
  margin: 60px auto 0;
  max-width: 420px;
  padding: 24px;
}
.kindle-submit {
  width: 100%;
}
        `,
      }}
    />
  );
}

export default async function KindleLayout({ children }: { children: ReactNode }) {
  const isSignedIn = Boolean(await getKindleSessionHouseId());
  const today = parseDateKey(isoDate(new Date()));
  const datePart = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const weekdayPart = today.toLocaleDateString("en-GB", {
    weekday: "long",
  });
  const todayLabel = `${datePart} ${weekdayPart}`;

  return (
    <main className="kindle-shell min-h-screen bg-white text-black">
      <KindleFallbackStyles />
      <div className="kindle-page mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4">
        <header className="kindle-header mb-4 border-b-4 border-black pb-4">
          <div className="kindle-header-top flex items-start justify-between gap-4">
            <div className="kindle-title-block">
              <p className="kindle-today">{todayLabel}</p>
            </div>
            {isSignedIn ? (
              <form action={kindleSignOutAction} className="kindle-lock">
                <button className="border border-black px-3 py-2 text-sm font-bold" type="submit">
                  Lock
                </button>
              </form>
            ) : null}
          </div>
          {isSignedIn ? <KindleNav /> : null}
        </header>
        {children}
      </div>
    </main>
  );
}
