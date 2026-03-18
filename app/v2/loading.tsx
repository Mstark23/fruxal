export default function V2Loading() {
  return (
    <div className="flex items-center justify-center h-full bg-[#0a0e17]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#00c853] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-sm text-gray-400">Loading your dashboard...</div>
      </div>
    </div>
  );
}
