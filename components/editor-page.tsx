"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Baby,
  Briefcase,
  CheckCircle2,
  Edit3,
  Heart,
  Loader2,
} from "lucide-react";

import { RecordingButton } from "@/components/recording-button";
import { TopicCard } from "@/components/topic-card";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { Progress } from "@/components/ui/progress";
import { StoryData } from "@/types/story";

type ProcessingStep = "idle" | "transcribing" | "summarizing" | "generating" | "done";

interface EditorPageProps {
  onComplete: (data: StoryData) => void;
}

const TOPICS = [
  { id: "childhood", icon: Baby, title: "어린 시절", description: "유년 시절의 기억과 추억" },
  { id: "career", icon: Briefcase, title: "직장 시절", description: "일과 커리어에 관한 이야기" },
  { id: "family", icon: Heart, title: "가족", description: "가족과의 소중한 순간" },
  { id: "free", icon: Edit3, title: "자유 주제", description: "원하는 이야기를 자유롭게" },
] as const;

const VISIBLE_STEPS = ["transcribing", "summarizing", "generating"] as const;
const PROCESSING_SEQUENCE = [...VISIBLE_STEPS, "done"] as const;

export function EditorPage({ onComplete }: EditorPageProps) {
  const [selectedTopic, setSelectedTopic] = useState<(typeof TOPICS)[number]["id"]>("childhood");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = setInterval(() => {
      setRecordingDuration((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    const interval = setInterval(() => {
      setProgress((previous) => (previous >= 100 ? 100 : previous + 1));
    }, 60);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleRecordingToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingDuration(0);
      setProcessingStep("idle");
      setProgress(0);
      return;
    }

    setIsRecording(false);
    void startProcessing();
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);

    setProcessingStep("transcribing");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setProcessingStep("summarizing");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setProcessingStep("generating");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setProcessingStep("done");
    setProgress(100);

    const topicTitle = TOPICS.find((topic) => topic.id === selectedTopic)?.title ?? "어린 시절";

    const mockData: StoryData = {
      topic: topicTitle,
      summary:
        "할머니 댁 마당에서 보낸 여름 방학은 제 인생에서 가장 행복했던 시간이었습니다. 매일 아침 닭들이 우는 소리에 일어나, 우물에서 시원한 물을 떠 마시던 기억이 생생합니다. 저녁이면 마루에 앉아 할머니께서 들려주시는 옛날이야기를 들으며 별을 세었습니다.",
      keywords: ["할머니", "여름방학", "시골", "추억", "가족"],
      chapters: [
        {
          title: "할머니 댁으로 가는 길",
          content:
            "기차를 타고 시골로 향하던 그 설렘을 잊을 수가 없습니다. 창밖으로 지나가는 논밭을 보며 곧 만날 할머니를 생각했죠.",
        },
        {
          title: "마당의 아침",
          content:
            "새벽 일찍 닭들이 우는 소리에 눈을 뜨면, 할머니는 이미 부엌에서 아침을 준비하고 계셨습니다. 구수한 된장찌개 냄새가 온 집안을 가득 채웠습니다.",
        },
        {
          title: "우물가의 추억",
          content:
            "두레박으로 물을 길어 올리는 것이 제일 재미있었습니다. 시원한 우물물에 수박을 담가 두었다가 오후에 꺼내 먹던 그 맛이란...",
        },
      ],
    };

    setIsProcessing(false);
    onComplete(mockData);
  };

  const statusCards = useMemo(() => {
    return [
      { id: "transcribing" as const, label: "음성 전사", description: "녹음된 음성을 텍스트로 변환합니다." },
      { id: "summarizing" as const, label: "내용 요약", description: "핵심 내용을 정리하고 다듬어요." },
      { id: "generating" as const, label: "챕터 생성", description: "이야기의 흐름에 따라 챕터를 만듭니다." },
    ];
  }, []);

  const getStepLabel = () => {
    switch (processingStep) {
      case "transcribing":
        return "전사중...";
      case "summarizing":
        return "요약중...";
      case "generating":
        return "챕터 생성중...";
      case "done":
        return "완료!";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F0E] via-[#0D1211] to-[#0E1513] px-6 pb-12 pt-24">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-center text-3xl text-[#E6F0ED]">이야기를 들려주세요</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="space-y-4 lg:col-span-3">
            <h2 className="text-lg text-[#E6F0ED]">주제 선택</h2>
            {TOPICS.map((topic) => (
              <TopicCard
                key={topic.id}
                icon={topic.icon}
                title={topic.title}
                description={topic.description}
                isSelected={topic.id === selectedTopic}
                onClick={() => setSelectedTopic(topic.id)}
              />
            ))}
          </aside>

          <section className="lg:col-span-6">
            <div className="rounded-2xl border border-[#2BA08C]/20 bg-[#0F3D35]/20 p-8">
              <div className="mb-8">
                <WaveformVisualizer isRecording={isRecording} />
              </div>

              <div className="mb-8 flex justify-center">
                <RecordingButton
                  isRecording={isRecording}
                  onClick={handleRecordingToggle}
                  duration={recordingDuration}
                />
              </div>

              {recordingDuration > 0 && !isRecording && !isProcessing && (
                <p className="text-center text-sm text-[#E6F0ED]/70">
                  녹음이 완료되었습니다. AI가 처리를 시작합니다.
                </p>
              )}
            </div>
          </section>

          <aside className="lg:col-span-3">
            <h2 className="mb-4 text-lg text-[#E6F0ED]">진행 상황</h2>
            <div className="space-y-4">
              {statusCards.map((step) => {
                const stepIndex = VISIBLE_STEPS.indexOf(step.id);
                const currentIndex =
                  processingStep === "idle"
                    ? -1
                    : PROCESSING_SEQUENCE.indexOf(processingStep as (typeof PROCESSING_SEQUENCE)[number]);
                const isActive = processingStep === step.id;
                const isCompleted = currentIndex > stepIndex;

                const icon = isActive ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#2BA08C]" />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-[#2BA08C]" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-[#2BA08C]/40" />
                );

                return (
                  <div
                    key={step.id}
                    className={[
                      "rounded-xl border p-4 transition-colors",
                      isActive ? "border-[#2BA08C] bg-[#2BA08C]/20" : "border-[#2BA08C]/20 bg-[#0F3D35]/20",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      {icon}
                      <div>
                        <div className="text-sm text-[#E6F0ED]">{step.label}</div>
                        <p className="text-xs text-[#E6F0ED]/60">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isProcessing && (
                <div className="rounded-xl border border-[#2BA08C]/20 bg-[#0F3D35]/20 p-4">
                  <p className="mb-3 text-center text-sm text-[#E6F0ED]">{getStepLabel()}</p>
                  <Progress value={progress} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
