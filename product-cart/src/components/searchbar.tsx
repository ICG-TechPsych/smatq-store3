import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center w-full bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 gap-2 hover:border-blue-300 transition focus-within:border-blue-600 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]">
      {/* Search icon */}
      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products…"
        className="flex-1 min-w-0 bg-transparent outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;