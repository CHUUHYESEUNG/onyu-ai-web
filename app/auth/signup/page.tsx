'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 유효성 검사
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, name);
      setSuccess(true);

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F0E] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-[#0E1513] rounded-lg p-8 shadow-xl">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-[#2BA08C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#E6F0ED] mb-2">
              회원가입 완료!
            </h2>
            <p className="text-[#A8C3BC] mb-4">
              환영합니다, {name || email}님!
            </p>
            <p className="text-sm text-[#A8C3BC]">
              이메일 인증 후 로그인해주세요.
              <br />
              잠시 후 로그인 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F0E] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#E6F0ED] mb-2">
            온유록
          </h1>
          <p className="text-[#A8C3BC]">
            말로 남기는 나의 기록
          </p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-[#0E1513] rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-[#E6F0ED] mb-6">
            회원가입
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#A8C3BC] mb-2"
              >
                이름 (선택사항)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F0E] border border-[#1F6F63] rounded-lg
                         text-[#E6F0ED] placeholder-[#A8C3BC]/50
                         focus:outline-none focus:ring-2 focus:ring-[#2BA08C]"
                placeholder="홍길동"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#A8C3BC] mb-2"
              >
                이메일 <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0B0F0E] border border-[#1F6F63] rounded-lg
                         text-[#E6F0ED] placeholder-[#A8C3BC]/50
                         focus:outline-none focus:ring-2 focus:ring-[#2BA08C]"
                placeholder="your@email.com"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#A8C3BC] mb-2"
              >
                비밀번호 <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0B0F0E] border border-[#1F6F63] rounded-lg
                         text-[#E6F0ED] placeholder-[#A8C3BC]/50
                         focus:outline-none focus:ring-2 focus:ring-[#2BA08C]"
                placeholder="최소 6자 이상"
              />
              <p className="mt-1 text-xs text-[#A8C3BC]/70">
                영문, 숫자 포함 6자 이상
              </p>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#A8C3BC] mb-2"
              >
                비밀번호 확인 <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0B0F0E] border border-[#1F6F63] rounded-lg
                         text-[#E6F0ED] placeholder-[#A8C3BC]/50
                         focus:outline-none focus:ring-2 focus:ring-[#2BA08C]"
                placeholder="비밀번호 재입력"
              />
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED]
                       rounded-lg font-semibold transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '회원가입 중...' : '회원가입'}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-[#A8C3BC] text-sm">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/auth/login"
                className="text-[#2BA08C] hover:underline font-medium"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* 돌아가기 */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-[#A8C3BC] hover:text-[#2BA08C] text-sm transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
