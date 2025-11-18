'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0E] flex items-center justify-center px-4">
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

        {/* 로그인 폼 */}
        <div className="bg-[#0E1513] rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-[#E6F0ED] mb-6">
            로그인
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#A8C3BC] mb-2"
              >
                이메일
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
                비밀번호
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
                placeholder="••••••••"
              />
            </div>

            {/* 비밀번호 찾기 */}
            <div className="text-right">
              <Link
                href="/auth/reset-password"
                className="text-sm text-[#2BA08C] hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED]
                       rounded-lg font-semibold transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center">
            <p className="text-[#A8C3BC] text-sm">
              계정이 없으신가요?{' '}
              <Link
                href="/auth/signup"
                className="text-[#2BA08C] hover:underline font-medium"
              >
                회원가입
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
