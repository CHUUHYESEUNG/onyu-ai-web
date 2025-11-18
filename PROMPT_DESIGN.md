# PROMPT_DESIGN.md - AI 프롬프트 설계 가이드

**작성일**: 2025-11-18
**버전**: 1.0.0

---

## 📋 개요

이 문서는 온유록(Onyu.ai) 프로젝트에서 사용하는 AI 프롬프트 전략과 설계 원칙을 설명합니다.

### 설계 목표

1. **일관성**: 모든 AI 생성 콘텐츠가 따뜻하고 존중하는 어조 유지
2. **유연성**: 다양한 사용 사례에 대응하는 전략 패턴
3. **품질**: 시니어 세대의 이야기를 품격 있게 표현
4. **확장성**: 새로운 프롬프트 모드를 쉽게 추가 가능

---

## 🏗️ PromptBuilder 아키텍처

### 전략 패턴 (Strategy Pattern)

```typescript
interface PromptOptions {
  mode: 'summarize' | 'structure' | 'warm_storytelling' |
        'respectful_memories' | 'chapter_generation' | 'question_generation';
  tone?: 'formal' | 'warm' | 'casual';
  style?: 'literary' | 'conversational' | 'journalistic';
  context?: string;
  userPreferences?: {
    honorifics?: boolean;  // 경어체 사용 여부
    emojiLevel?: 'none' | 'minimal' | 'moderate';
    detailLevel?: 'concise' | 'moderate' | 'detailed';
  };
}

export class PromptBuilder {
  private options: PromptOptions;

  constructor(options: PromptOptions) {
    this.options = {
      tone: 'warm',  // 기본값: 따뜻한 어조
      style: 'conversational',  // 기본값: 대화체
      ...options,
    };
  }

  build(): string {
    switch (this.options.mode) {
      case 'summarize':
        return this.buildSummarizePrompt();
      case 'structure':
        return this.buildStructurePrompt();
      case 'warm_storytelling':
        return this.buildWarmStorytellingPrompt();
      case 'respectful_memories':
        return this.buildRespectfulMemoriesPrompt();
      case 'chapter_generation':
        return this.buildChapterGenerationPrompt();
      case 'question_generation':
        return this.buildQuestionGenerationPrompt();
      default:
        throw new Error(`Unknown prompt mode: ${this.options.mode}`);
    }
  }
}
```

---

## 📝 프롬프트 모드 상세

### 1. summarize (요약 모드)

**목적**: 긴 인터뷰 전사본을 간결하고 읽기 쉬운 요약으로 변환

**사용 시점**:
- 녹음 후 전사 완료 시
- 여러 세션의 내용을 하나로 통합할 때

**프롬프트 구조**:
```
당신은 전문 자서전 편집자입니다.
다음 인터뷰 전사본을 읽고, 핵심 내용을 3-5문단으로 요약해주세요.

요구사항:
- 화자의 감정과 뉘앙스를 보존하세요
- 중요한 날짜, 장소, 인물 이름은 반드시 포함하세요
- 존댓말로 작성하되, 따뜻하고 친근한 어조를 유지하세요
- 시간 순서를 명확히 하세요

전사본:
{transcript}

요약:
```

**출력 예시**:
```
할머니께서는 1953년 부산에서 태어나셨습니다. 6.25 전쟁이 끝난 직후라
물자가 부족했지만, 가족들은 서로를 의지하며 힘든 시절을 이겨냈다고
하십니다. 특히 어머니께서 새벽부터 시장에 나가 장사를 하시며 가족을
부양하셨던 기억이 가장 또렷하다고 하셨습니다.
```

**톤 변형**:
- `tone: 'formal'`: "~하셨습니다", "~였습니다" (격식체)
- `tone: 'warm'`: "~하셨어요", "~이셨어요" (존댓말, 친근함)
- `tone: 'casual'`: "~했다", "~였다" (평서체, 3인칭 전기)

---

### 2. structure (구조화 모드)

**목적**: 전사본을 자서전 스타일의 문학적 텍스트로 재구성

**사용 시점**:
- 요약 완료 후 최종 자서전 생성 시
- 여러 섹션을 하나의 챕터로 통합할 때

**프롬프트 구조**:
```
당신은 자서전 작가입니다. 다음 요약본을 바탕으로 감동적이고
읽기 좋은 자서전 텍스트를 작성해주세요.

스타일 가이드:
- 1인칭 시점으로 전환하세요 ("나는...", "저는...")
- 문학적 표현을 사용하되, 과도하지 않게 하세요
- 문단은 3-5줄로 구성하세요
- 감정을 섬세하게 표현하세요
- 대화는 따옴표로 감싸세요

요약본:
{summary}

자서전 텍스트:
```

**출력 예시**:
```
나는 1953년 봄, 부산의 작은 판잣집에서 태어났다. 전쟁의 포화가
채 가시지 않은 시절이었다. 밥 한 끼가 귀했던 그 시절, 어머니는
새벽부터 시장 골목을 누비며 우리를 먹여 살리셨다.

"너희들만 잘 먹으면 돼. 엄마는 괜찮아."

어머니의 그 한마디가, 지금도 내 가슴 한편에 따스하게 남아 있다.
```

---

### 3. warm_storytelling (따뜻한 스토리텔링)

**목적**: 감정적 연결을 강조한 따뜻한 이야기 형식

**사용 시점**:
- 가족 간 공유용 콘텐츠 생성 시
- 감정적 순간을 강조할 때

**프롬프트 구조**:
```
당신은 가족의 이야기를 소중히 전하는 스토리텔러입니다.
다음 내용을 따뜻하고 감동적인 이야기로 풀어주세요.

특별 요구사항:
- 가족 간의 사랑과 유대를 강조하세요
- 작은 디테일에 의미를 부여하세요
- 감정을 솔직하게 표현하세요
- 독자가 공감할 수 있도록 보편적 감정을 담으세요

원본:
{content}

따뜻한 이야기:
```

**출력 예시**:
```
할머니의 손은 언제나 따뜻했다. 그 손으로 밥을 짓고, 빨래를 하고,
우리의 머리를 쓰다듬어 주셨다. 지금 생각해보면, 그 따스함은 단순히
체온만이 아니었다. 그것은 할머니의 무조건적인 사랑이었다.

"할머니, 손이 왜 이렇게 거칠어요?"
"이 손으로 너희들 키웠으니까."

할머니는 그렇게 웃으며 대답하셨다.
```

---

### 4. respectful_memories (존중하는 회고록)

**목적**: 존엄하고 품격 있는 격식체 회고록

**사용 시점**:
- 공식 출판용 자서전
- 높은 품격을 요구하는 경우

**프롬프트 구조**:
```
당신은 고급 회고록 작가입니다. 다음 내용을 존중하고 품격 있는
문체로 작성해주세요.

문체 가이드:
- 격식 있는 한국어 사용 (~하였다, ~되었다)
- 과도한 감상은 배제하고 사실 중심으로
- 역사적 맥락을 함께 언급하세요
- 절제된 감정 표현

원본:
{content}

회고록:
```

**출력 예시**:
```
1953년, 대한민국은 전쟁의 상흔에서 벗어나려 몸부림치던 시기였다.
필자는 바로 그 해 부산에서 출생하였다. 당시 부산은 임시수도로서
전국에서 모여든 피난민들로 북적였고, 우리 가족 역시 그 중 하나였다.

모친께서는 생계를 위해 새벽 시장에서 좌판을 벌이셨다. 그 모습은
당시 수많은 어머니들의 전형이었으나, 어린 내게는 세상에서 가장
위대한 모습으로 기억된다.
```

---

### 5. chapter_generation (챕터 자동 생성)

**목적**: 전체 인터뷰를 분석하여 자서전 챕터 구조 제안

**사용 시점**:
- 프로젝트 시작 시 챕터 구조 수립
- 기존 챕터 재구성 필요 시

**프롬프트 구조**:
```
당신은 자서전 기획 전문가입니다. 다음 인터뷰 전사본을 분석하여
자서전 챕터 구조를 제안해주세요.

요구사항:
- 5-8개의 챕터로 구성하세요
- 각 챕터는 시간대 또는 주제로 구분하세요
- 챕터 제목은 감성적이면서도 명확해야 합니다
- 각 챕터의 핵심 주제를 간단히 설명하세요

전사본:
{transcripts}

JSON 형식으로 출력:
{
  "chapters": [
    {
      "title": "챕터 제목",
      "description": "챕터 설명",
      "timeframe": "1950-1960년대",
      "keyThemes": ["주제1", "주제2"]
    }
  ]
}
```

**출력 예시**:
```json
{
  "chapters": [
    {
      "title": "전쟁의 그림자 아래",
      "description": "6.25 전쟁 직후 부산에서의 유년기",
      "timeframe": "1953-1960",
      "keyThemes": ["가난", "가족애", "생존"],
      "estimatedDuration": 15
    },
    {
      "title": "배움의 길",
      "description": "어려운 환경 속에서도 이어간 학업",
      "timeframe": "1960-1968",
      "keyThemes": ["교육", "꿈", "희망"],
      "estimatedDuration": 12
    }
  ]
}
```

---

### 6. question_generation (질문 자동 생성)

**목적**: 챕터/세션에 맞는 인터뷰 질문 자동 생성

**사용 시점**:
- 새 세션 시작 시
- 기존 답변을 바탕으로 후속 질문 생성 시

**프롬프트 구조**:
```
당신은 시니어 인터뷰 전문가입니다. 다음 정보를 바탕으로
적절한 인터뷰 질문을 생성해주세요.

질문 원칙:
- 열린 질문 형식 (yes/no가 아닌)
- 구체적 기억을 떠올리게 하는 질문
- 감정을 표현할 수 있는 질문
- 한 번에 하나의 주제만 다루는 질문
- 시니어가 이해하기 쉬운 표현 사용

챕터: {chapterTitle}
세션: {sessionTitle}
이전 답변: {previousAnswers}

JSON 형식으로 5-7개 질문:
{
  "questions": [
    {
      "prompt": "질문 내용",
      "follow_up": "후속 질문 (선택적)",
      "hints": ["답변 힌트1", "답변 힌트2"]
    }
  ]
}
```

**출력 예시**:
```json
{
  "questions": [
    {
      "prompt": "고향 집 근처에 어떤 풍경이 있었나요? 지금도 기억나는 장소가 있으신가요?",
      "follow_up": "그곳에서 어떤 일들이 있었나요?",
      "hints": ["동네 골목", "시장", "학교", "놀이터"]
    },
    {
      "prompt": "어린 시절 가장 좋아했던 음식은 무엇이었나요? 누가 만들어 주셨나요?",
      "follow_up": "그 음식을 먹을 때 어떤 기분이었나요?",
      "hints": ["어머니의 음식", "명절 음식", "간식"]
    }
  ]
}
```

---

## 🎨 어조(Tone) 및 스타일(Style) 설정

### 어조 (Tone)

**1. formal (격식체)**:
- 사용: ~하였다, ~되었다, ~였습니다
- 대상: 공식 출판물, 고령 시니어
- 예시: "필자는 1953년 부산에서 출생하였다."

**2. warm (따뜻한 존댓말)**:
- 사용: ~하셨어요, ~이셨어요, ~입니다
- 대상: 가족 공유용, 일반 사용자
- 예시: "할머니는 부산에서 태어나셨어요."

**3. casual (평서체)**:
- 사용: ~했다, ~였다, ~이다
- 대상: 젊은 세대, 3인칭 전기
- 예시: "그는 1953년 부산에서 태어났다."

### 스타일 (Style)

**1. literary (문학적)**:
- 비유와 은유 사용
- 리드미컬한 문장 구조
- 예시: "전쟁의 포화가 채 가시지 않은 봄날, 나는 이 세상에 첫 울음을 터뜨렸다."

**2. conversational (대화체)**:
- 일상적 표현 사용
- 짧고 명료한 문장
- 예시: "나는 1953년 봄에 태어났다. 전쟁이 막 끝난 시기였다."

**3. journalistic (저널리즘)**:
- 사실 중심, 객관적
- 날짜와 장소 명시
- 예시: "1953년 3월 15일, 부산시 중구에서 출생."

---

## 🔄 폴백 전략 (Fallback Strategies)

### AI API 실패 시

```typescript
export async function generateChaptersFromTranscripts(
  transcripts: string[],
  fallbackStrategy: 'simple' | 'manual' | 'template' = 'simple'
): Promise<Chapter[]> {
  try {
    // 1차 시도: OpenAI GPT-4
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'system', content: prompt }],
    });
    return parseChapters(response);
  } catch (error) {
    console.error('AI 생성 실패, 폴백 전략 사용:', fallbackStrategy);

    if (fallbackStrategy === 'simple') {
      // 2차 시도: 간단한 규칙 기반
      return generateSimpleChapters(transcripts);
    } else if (fallbackStrategy === 'manual') {
      // 3차 시도: 사용자 수동 입력 유도
      return promptUserForChapters();
    } else {
      // 4차 시도: 기본 템플릿 제공
      return getDefaultChapterTemplate();
    }
  }
}
```

### 간단한 규칙 기반 챕터 생성

```typescript
function generateSimpleChapters(transcripts: string[]): Chapter[] {
  // 키워드 기반 시간대 추정
  const timeKeywords = {
    childhood: ['어렸을 때', '초등학교', '유년기'],
    youth: ['중학교', '고등학교', '청소년'],
    adulthood: ['대학', '직장', '결혼'],
    middleAge: ['자녀', '육아', '중년'],
    retirement: ['은퇴', '노년', '손주'],
  };

  return [
    {
      title: '어린 시절',
      description: '유년기의 기억들',
      order: 0,
      status: 'not_started',
    },
    {
      title: '청년 시절',
      description: '젊은 날의 도전과 성장',
      order: 1,
      status: 'not_started',
    },
    // ... 나머지 기본 챕터
  ];
}
```

---

## 🧪 프롬프트 테스트 및 검증

### 테스트 케이스

**테스트 1: 짧은 전사본 (50단어 미만)**
```typescript
const shortTranscript = "나는 부산에서 태어났어요. 전쟁 직후였죠.";
const result = await summarize(shortTranscript);
// 예상: 원본 그대로 반환 또는 최소 확장
```

**테스트 2: 긴 전사본 (1000단어 이상)**
```typescript
const longTranscript = "..."; // 10분 인터뷰 전사본
const result = await summarize(longTranscript);
// 예상: 3-5문단 요약, 핵심 정보 보존
```

**테스트 3: 감정 표현이 많은 전사본**
```typescript
const emotionalTranscript = "정말 힘들었어요... (눈물) 하지만 이겨냈죠.";
const result = await warmStoryTelling(emotionalTranscript);
// 예상: 감정이 문학적으로 승화됨
```

### 품질 지표

**정량적 지표**:
- 요약 비율: 원본 대비 20-30%
- 문장 길이: 15-25단어
- 문단 수: 3-5개
- 응답 시간: 5초 이내

**정성적 지표**:
- 존댓말 일관성 ✅
- 시간 순서 정확성 ✅
- 감정 보존 ✅
- 가독성 ✅

---

## 📚 참고 자료

### 한국어 자서전 스타일 가이드

**존댓말 체계**:
- 격식체: ~습니다/~했습니다
- 비격식체: ~해요/~했어요
- 평서체: ~한다/~했다

**시간 표현**:
- 절대 시간: "1953년", "여름"
- 상대 시간: "그때", "어릴 적"
- 회상 표현: "~했었다", "~이었다"

**감정 표현**:
- 직접: "기뻤다", "슬펐다"
- 간접: "가슴이 뛰었다", "눈물이 났다"
- 문학적: "따스함이 밀려왔다"

### OpenAI API 모범 사례

**토큰 관리**:
- 입력: 최대 4000 토큰 (약 3000단어)
- 출력: 최대 1000 토큰 (약 750단어)
- 여유분: 20% 버퍼 유지

**비용 최적화**:
- GPT-4 Turbo: $0.01/1K 토큰 (입력)
- GPT-3.5 Turbo: $0.0005/1K 토큰 (입력)
- 전략: 짧은 작업은 3.5, 복잡한 작업은 4

---

## 🔮 향후 개선 계획

### Phase 1: 프롬프트 최적화
- A/B 테스트로 최적 프롬프트 발견
- 사용자 피드백 기반 개선
- 한국어 특화 프롬프트 엔지니어링

### Phase 2: 다국어 지원
- 영어, 일본어, 중국어 프롬프트
- 언어별 문화적 뉘앙스 반영

### Phase 3: 개인화
- 사용자 스타일 학습
- 가족 구성원별 맞춤 어조
- 주제별 프롬프트 자동 선택

### Phase 4: 멀티모달
- 사진 캡션 자동 생성
- 음성 억양 기반 감정 분석
- 비디오 인터뷰 지원

---

**마지막 업데이트**: 2025-11-18
**작성자**: Claude Code
**버전**: 1.0.0
