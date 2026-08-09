interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search products..."}
        className="w-full bg-surface-2 border border-border placeholder:text-text-subtle rounded-lg pl-10 pr-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted transition-colors"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
