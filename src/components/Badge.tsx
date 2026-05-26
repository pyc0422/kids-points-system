export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green";
}) {
  const classes = {
    neutral: "bg-zinc-100 text-zinc-600",
    blue: "bg-cyan-50 text-cyan-800",
    green: "bg-lime-50 text-lime-800",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${classes[tone]}`}
    >
      {children}
    </span>
  );
}
