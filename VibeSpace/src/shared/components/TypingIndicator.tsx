export default function TypingIndicator() {
  return (
    <div className="flex z-10 h-7 items-center gap-2">
      <div className="bg-gray-200 px-3 py-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}