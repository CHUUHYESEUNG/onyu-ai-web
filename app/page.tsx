'use client';

import { useState } from "react";

import { Footer } from "@/components/footer";
import { EditorPage } from "@/components/editor-page";
import { LandingPage } from "@/components/landing-page";
import { Navigation } from "@/components/navigation";
import { ResultPage } from "@/components/result-page";
import { StoryData } from "@/types/story";

type PageState = "landing" | "editor" | "result";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageState>("landing");
  const [storyData, setStoryData] = useState<StoryData | null>(null);

  const handleStart = () => setCurrentPage("editor");

  const handleComplete = (data: StoryData) => {
    setStoryData(data);
    setCurrentPage("result");
  };

  const handleRegenerate = () => {
    setStoryData(null);
    setCurrentPage("editor");
  };

  const handleNextTopic = () => {
    setStoryData(null);
    setCurrentPage("editor");
  };

  return (
    <div className="min-h-screen bg-[#0B0F0E] text-[#E6F0ED]">
      <Navigation />

      {currentPage === "landing" && <LandingPage onStartClick={handleStart} />}

      {currentPage === "editor" && <EditorPage onComplete={handleComplete} />}

      {currentPage === "result" && storyData ? (
        <ResultPage storyData={storyData} onRegenerate={handleRegenerate} onNextTopic={handleNextTopic} />
      ) : null}

      <Footer />
    </div>
  );
}
