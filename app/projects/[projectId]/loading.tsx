export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center gap-4">
        {/* 스피너 */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* 로딩 텍스트 */}
        <div className="text-center">
          <p className="text-white font-medium mb-1">페이지를 불러오는 중...</p>
          <p className="text-white/60 text-sm">잠시만 기다려주세요</p>
        </div>
      </div>
    </div>
  );
}
