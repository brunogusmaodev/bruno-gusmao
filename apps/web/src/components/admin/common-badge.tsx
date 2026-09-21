export function AdminBadge({
  name,
  bgColor,
  textColor,
}: {
  name: string;
  bgColor?: string | null;
  textColor?: string | null;
}) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: bgColor ?? "rgba(37, 99, 235, 0.15)",
        color: textColor ?? "#60a5fa",
      }}
    >
      {name}
    </span>
  );
}
