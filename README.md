This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Summary

온유록(Onyu.ai)은 음성 인터뷰만으로 삶의 이야기를 기록하고, AI가 정리한 텍스트를 **본인 목소리 오디오북**으로 재구성하는 감성형 자서전 플랫폼입니다. 단순 STT 툴에서 멈추지 않고 Whisper·GPT 조합으로 생애별 서사를 구성하며, 음성 클로닝 기반 낭독으로 기억의 온도를 지키는 데 집중합니다.

- **왜 필요한가?** 시니어 세대의 67%는 자서전 작성 의향이 있지만 실제 작성률은 8%에 불과합니다. 글쓰기 장벽을 제거하고 말하기만 하면 기록이 완성되는 경험이 핵심 가치입니다.
- **어떤 경험을 주는가?** 질문 흐름에 맞춰 인터뷰를 진행하면 AI가 내용을 정리·요약·챕터화하고, 텍스트·PDF·오디오북을 한 번에 완성합니다. 가족과 공유 가능한 ‘AI 인생 앨범’을 목표로 합니다.
- **누가 사용하는가?** 글쓰기 부담을 느끼는 중·장년층, 세대 기록을 남기려는 가족, 복지기관·지자체·교육기관 등 B2B 파트너가 주요 사용처입니다.
- **무엇으로 만드는가?** Next.js 16, React 19, TailwindCSS, Supabase 기반으로 웹 MVP를 구축하고, DnD Kit·Lottie로 시니어 친화 인터랙션을 제공합니다. 차후 OpenVoice/ElevenLabs, SSML Prosody를 통해 감정형 TTS·오디오북 기능을 고도화합니다.
- **어떻게 확장되는가?** MVP 출시 → 오디오북 베타 → 게이미피케이션 UX → 기관 연계 프로그램 순으로 확장하며 ‘AI 구술사 플랫폼’으로 자리매김하는 로드맵을 추진합니다.

온유록의 궁극적 목표는 ‘기술이 사람의 기억을 보존하고 다시 들려주는 방식’을 재정의하는 것입니다. 말하는 순간마다 기록이 쌓이고, 그 기록이 나와 가족의 목소리로 살아 움직이는 경험을 지향합니다.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
