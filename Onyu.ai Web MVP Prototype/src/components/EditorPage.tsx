import { useState, useEffect } from "react";
import { Baby, Briefcase, Heart, Edit3, Loader2, CheckCircle2 } from "lucide-react";
import { TopicCard } from "./TopicCard";
import { RecordingButton } from "./RecordingButton";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

interface EditorPageProps {
  onComplete: (data: StoryData) => void;
}

export interface StoryData {
  topic: string;
  summary: string;
  keywords: string[];
  chapters: {
    title: string;
    content: string;
  }[];
}

type ProcessingStep = 'transcribing' | 'summarizing' | 'generating' | 'done';

const topics = [
  {
    id: 'childhood',
    icon: Baby,
    title: '어린 시절',
    description: '유년 시절의 기억과 추억'
  },
  {
    id: 'career',
    icon: Briefcase,
    title: '직장 시절',
    description: '일과 커리어에 관한 이야기'
  },
  {
    id: 'family',
    icon: Heart,
    title: '가족',
    description: '가족과의 소중한 순간'
  },
  {
    id: 'free',
    icon: Edit3,
    title: '자유 주제',
    description: '원하는 이야기를 자유롭게'
  }
];

export function EditorPage({ onComplete }: EditorPageProps) {
  const [selectedTopic, setSelectedTopic] = useState('childhood');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('transcribing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleRecordingToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingDuration(0);
    } else {
      setIsRecording(false);
      startProcessing();
    }
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate transcribing
    setProcessingStep('transcribing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate summarizing
    setProcessingStep('summarizing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate generating chapters
    setProcessingStep('generating');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessingStep('done');
    
    // Generate mock data
    const mockData: StoryData = {
      topic: topics.find(t => t.id === selectedTopic)?.title || '어린 시절',
      summary: '할머니 댁 마당에서 보낸 여름 방학은 제 인생에서 가장 행복했던 시간이었습니다. 매일 아침 닭들이 우는 소리에 일어나, 우물에서 시원한 물을 떠 마시던 기억이 생생합니다. 저녁이면 마루에 앉아 할머니께서 들려주시는 옛날이야기를 들으며 별을 세었습니다.',
      keywords: ['할머니', '여름방학', '시골', '추억', '가족'],
      chapters: [
        {
          title: '할머니 댁으로 가는 길',
          content: '기차를 타고 시골로 향하던 그 설렘을 잊을 수가 없습니다. 창밖으로 지나가는 논밭을 보며 곧 만날 할머니를 생각했죠.'
        },
        {
          title: '마당의 아침',
          content: '새벽 일찍 닭들이 우는 소리에 눈을 뜨면, 할머니는 이미 부엌에서 아침을 준비하고 계셨습니다. 구수한 된장찌개 냄새가 온 집안을 가득 채웠습니다.'
        },
        {
          title: '우물가의 추억',
          content: '두레박으로 물을 길어 올리는 것이 제일 재미있었습니다. 시원한 우물물에 수박을 담가 두었다가 오후에 꺼내 먹던 그 맛이란...'
        }
      ]
    };
    
    setTimeout(() => {
      onComplete(mockData);
    }, 1000);
  };

  const getStepLabel = () => {
    switch (processingStep) {
      case 'transcribing':
        return '전사중...';
      case 'summarizing':
        return '요약중...';
      case 'generating':
        return '챕터 생성중...';
      case 'done':
        return '완료!';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F0E] via-[#0D1211] to-[#0E1513] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-[#E6F0ED] text-center mb-12" style={{ fontSize: '2.5rem' }}>
          이야기를 들려주세요
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Topic Selection */}
          <div className="lg:col-span-3">
            <h2 className="text-[#E6F0ED] mb-4">주제 선택</h2>
            <div className="space-y-4">
              {topics.map(topic => (
                <TopicCard
                  key={topic.id}
                  icon={topic.icon}
                  title={topic.title}
                  description={topic.description}
                  isSelected={selectedTopic === topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Center: Recording Interface */}
          <div className="lg:col-span-6">
            <div className="bg-[#0F3D35]/20 border border-[#2BA08C]/20 rounded-2xl p-8">
              <div className="mb-8">
                <WaveformVisualizer isRecording={isRecording} />
              </div>
              
              <div className="flex justify-center mb-8">
                <RecordingButton
                  isRecording={isRecording}
                  onClick={handleRecordingToggle}
                  duration={recordingDuration}
                />
              </div>
              
              {recordingDuration > 0 && !isRecording && !isProcessing && (
                <div className="text-center">
                  <p className="text-[#E6F0ED]/70 mb-4">
                    녹음이 완료되었습니다. AI가 처리를 시작합니다.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Progress Indicator */}
          <div className="lg:col-span-3">
            <h2 className="text-[#E6F0ED] mb-4">진행 상황</h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                processingStep === 'transcribing' || isProcessing
                  ? 'bg-[#2BA08C]/20 border-[#2BA08C]'
                  : 'bg-[#0F3D35]/20 border-[#2BA08C]/20'
              }`}>
                <div className="flex items-center gap-3">
                  {processingStep === 'transcribing' && isProcessing ? (
                    <Loader2 className="w-5 h-5 text-[#2BA08C] animate-spin" />
                  ) : processingStep !== 'transcribing' && isProcessing ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2BA08C]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#2BA08C]/40" />
                  )}
                  <span className="text-[#E6F0ED]">음성 전사</span>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border ${
                processingStep === 'summarizing'
                  ? 'bg-[#2BA08C]/20 border-[#2BA08C]'
                  : (processingStep === 'generating' || processingStep === 'done') && isProcessing
                  ? 'bg-[#0F3D35]/20 border-[#2BA08C]'
                  : 'bg-[#0F3D35]/20 border-[#2BA08C]/20'
              }`}>
                <div className="flex items-center gap-3">
                  {processingStep === 'summarizing' ? (
                    <Loader2 className="w-5 h-5 text-[#2BA08C] animate-spin" />
                  ) : (processingStep === 'generating' || processingStep === 'done') && isProcessing ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2BA08C]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#2BA08C]/40" />
                  )}
                  <span className="text-[#E6F0ED]">내용 요약</span>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border ${
                processingStep === 'generating'
                  ? 'bg-[#2BA08C]/20 border-[#2BA08C]'
                  : processingStep === 'done' && isProcessing
                  ? 'bg-[#0F3D35]/20 border-[#2BA08C]'
                  : 'bg-[#0F3D35]/20 border-[#2BA08C]/20'
              }`}>
                <div className="flex items-center gap-3">
                  {processingStep === 'generating' ? (
                    <Loader2 className="w-5 h-5 text-[#2BA08C] animate-spin" />
                  ) : processingStep === 'done' && isProcessing ? (
                    <CheckCircle2 className="w-5 h-5 text-[#2BA08C]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#2BA08C]/40" />
                  )}
                  <span className="text-[#E6F0ED]">챕터 생성</span>
                </div>
              </div>
              
              {isProcessing && (
                <div className="mt-6 p-4 bg-[#0F3D35]/20 border border-[#2BA08C]/20 rounded-xl">
                  <p className="text-[#E6F0ED] mb-3 text-center">
                    {getStepLabel()}
                  </p>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
