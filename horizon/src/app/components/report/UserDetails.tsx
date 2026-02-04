type UserDetailsProps = {
  label?: string;
  name: string | null;
};

export default function UserDetails({ label = "Prepared for", name }: UserDetailsProps) {
  // If API fails, provide a sensible default so the UI doesn't look broken
  const displayName = name || "Valued Member";

  return (
    <div className="border-l-4 border-black pl-4 py-1">
      <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
        {label}
      </p>
      <p className="text-lg font-semibold text-black">
        {displayName}
      </p>
    </div>
  );
}