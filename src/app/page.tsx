"use client";

import { useState } from "react";
import ImageUpload from "../components/ImageUpload";
import { ArrowRight } from "lucide-react";
import { apiService } from "../services/api";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import LoadingState from "../components/LoadingState";
import AnalysisResults from "../components/AnalysisResults";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [apiUrl, setApiUrl] = useState("");

  // Backend Results State
  const [segmentationResult, setSegmentationResult] = useState<{
    mask: string;
    maskedImage: string;
  } | null>(null);

  const [classificationResult, setClassificationResult] = useState<{
    class_id: number;
  } | null>(null);

  // Load settings on mount
  useState(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.apiUrl) setApiUrl(data.apiUrl);
      })
      .catch((err) => console.error("Failed to load settings:", err));
  });

  const handleImageUpload = (file: File, previewUrl: string) => {
    setUploadedFile(file);
    setUploadedImageUrl(previewUrl);
    setHasResults(false);
    setSegmentationResult(null);
    setClassificationResult(null);
  };

  const handleClearImage = () => {
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    setUploadedFile(null);
    setUploadedImageUrl(null);
    setHasResults(false);
    setIsAnalyzing(false);
    setSegmentationResult(null);
    setClassificationResult(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    // Refresh settings before analyzing to ensure we have the latest URL from navbar
    let currentApiUrl = apiUrl;
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.apiUrl) {
        currentApiUrl = data.apiUrl;
        setApiUrl(data.apiUrl);
      }
    } catch (e) {
      console.error("Failed to refresh settings", e);
    }

    if (!currentApiUrl) {
      alert("Please configure your Ngrok API URL in the settings (gear icon in navbar)!");
      return;
    }

    setIsAnalyzing(true);
    setHasResults(false);

    try {
      // Run both requests in parallel
      const [segData, classData] = await Promise.all([
        apiService.segmentImage(uploadedFile, currentApiUrl),
        apiService.classifyImage(uploadedFile, currentApiUrl)
      ]);

      setSegmentationResult({
        mask: `data:image/png;base64,${segData.mask}`,
        maskedImage: `data:image/png;base64,${segData.masked_image}`,
      });

      setClassificationResult({
        class_id: classData.class_id
      });

      setHasResults(true);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to connect to backend. Check your Ngrok URL and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        {/* Upload Section - Shows when no results */}
        {!hasResults && !isAnalyzing && (
          <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">

            <HeroSection />

            {/* Upload Component */}
            <div className="bg-card/30 backdrop-blur-sm rounded-3xl p-1 border border-border/50 shadow-xl shadow-primary/5">
              <ImageUpload
                onImageUpload={handleImageUpload}
                uploadedImage={uploadedImageUrl}
                onClearImage={handleClearImage}
              />
            </div>

            {/* Analyze Button */}
            {uploadedImageUrl && (
              <div className="flex justify-center animate-fade-in pt-4">
                <button
                  onClick={handleAnalyze}
                  className="group relative px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all duration-300 shadow-premium-lg hover:shadow-premium-xl hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
                >
                  Analyze Image
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            <FeaturesSection />
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && <LoadingState />}

        {/* Results Layout */}
        {hasResults && uploadedImageUrl && segmentationResult && classificationResult && (
          <AnalysisResults
            uploadedImageUrl={uploadedImageUrl}
            segmentationResult={segmentationResult}
            classificationResult={classificationResult}
            onClearImage={handleClearImage}
          />
        )}
      </main>
    </div>
  );
}
