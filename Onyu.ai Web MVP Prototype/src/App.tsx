import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { EditorPage, StoryData } from "./components/EditorPage";
import { ResultPage } from "./components/ResultPage";

type Page = 'landing' | 'editor' | 'result';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [storyData, setStoryData] = useState<StoryData | null>(null);

  const handleStartClick = () => {
    setCurrentPage('editor');
  };

  const handleComplete = (data: StoryData) => {
    setStoryData(data);
    setCurrentPage('result');
  };

  const handleRegenerate = () => {
    setCurrentPage('editor');
    setStoryData(null);
  };

  const handleNextTopic = () => {
    setCurrentPage('editor');
    setStoryData(null);
  };

  return (
    <div className="dark min-h-screen">
      <Navigation />
      
      {currentPage === 'landing' && (
        <LandingPage onStartClick={handleStartClick} />
      )}
      
      {currentPage === 'editor' && (
        <EditorPage onComplete={handleComplete} />
      )}
      
      {currentPage === 'result' && storyData && (
        <ResultPage 
          storyData={storyData}
          onRegenerate={handleRegenerate}
          onNextTopic={handleNextTopic}
        />
      )}
      
      <Footer />
    </div>
  );
}
