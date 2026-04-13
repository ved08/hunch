interface AvatarProps {
  username: string;
  size?: number;
}

const palette = [
  "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E",
  "#06B6D4", "#14B8A6", "#F59E0B", "#84CC16",
  "#3B82F6", "#A855F7",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function Avatar({ username, size = 36 }: AvatarProps) {
  const bg = palette[hashString(username) % palette.length];

  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center font-semibold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        fontSize: size * 0.38,
      }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}
