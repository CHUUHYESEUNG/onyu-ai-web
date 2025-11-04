export function Footer() {
  return (
    <footer className="bg-[#0B0F0E] border-t border-[#1F6F63]/20 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[#E6F0ED] mb-4">Onyu.ai</h4>
            <p className="text-[#E6F0ED]/60">
              당신의 목소리가 한 편의 이야기로.
            </p>
          </div>
          
          <div>
            <h4 className="text-[#E6F0ED] mb-4">서비스</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-[#E6F0ED]/60 hover:text-[#2BA08C] transition-colors">시작하기</a></li>
              <li><a href="#" className="text-[#E6F0ED]/60 hover:text-[#2BA08C] transition-colors">예시 보기</a></li>
              <li><a href="#" className="text-[#E6F0ED]/60 hover:text-[#2BA08C] transition-colors">가격</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[#E6F0ED] mb-4">지원</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-[#E6F0ED]/60 hover:text-[#2BA08C] transition-colors">도움말</a></li>
              <li><a href="#" className="text-[#E6F0ED]/60 hover:text-[#2BA08C] transition-colors">문의하기</a></li>
              <li><a href="#" className="text-[#E6F0ED]/60 hover:text-[#2BA08C] transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[#E6F0ED] mb-4">법적 고지</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-[#E6F0ED]/60 hover:text-[#2BA08C] transition-colors">이용약관</a></li>
              <li><a href="#" className="text-[#E6F0ED]/60 hover:text-[#2BA08C] transition-colors">개인정보처리방침</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[#1F6F63]/20 text-center text-[#E6F0ED]/40">
          <p>© 2025 Onyu.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
