"use client";

import { useState } from "react";
import ImageUpload from "../components/ImageUpload";
import ImageCanvas from "../components/ImageCanvas";
import { Settings, Link as LinkIcon, Download, Layers, Zap, Scan, ArrowRight, Activity, CheckCircle } from "lucide-react";
import ResultsDisplay from "../components/ResultsDisplay";
import { apiService } from "../services/api";


export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"segmentation" | "classification">("segmentation");

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
    setActiveTab("segmentation");
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

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="inline-flex items-center justify-center p-2 bg-primary/5 rounded-2xl mb-2">
                  <Scan className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight">
                  AI Image <span className="text-primary">Analysis</span>
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Upload an image to perform <span className="font-semibold text-foreground">Segmentation</span> and <span className="font-semibold text-foreground">Classification</span> simultaneously.
              </p>
            </div>


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

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              {[
                { icon: Layers, title: "Dual Analysis", desc: "Performs both Segmentation and Classification in one go." },
                { icon: Zap, title: "Advanced Models", desc: "Powered by UNet (EfficientNet) and ResNet50." },
                { icon: Scan, title: "Instant Results", desc: "Get accurate masks and class predictions in seconds." },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl text-center hover:border-primary/30 hover:bg-card/80 transition-all duration-300 group"
                >
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Analyzing Image</h2>
            <p className="text-muted-foreground text-lg animate-pulse">Running Segmentation & Classification...</p>
          </div>
        )}

        {/* Results Layout */}
        {hasResults && uploadedImageUrl && segmentationResult && classificationResult && (
          <div className="animate-fade-in max-w-[1400px] mx-auto">
            {/* Header with Action Button */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-border/40">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                    Analysis Results
                  </h2>
                </div>

                <div className="hidden md:block h-8 w-px bg-border" />

                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Processing Complete</span>
                </div>
              </div>

              {/* Segment Another Image Button */}
              <button
                onClick={handleClearImage}
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 shadow-premium hover:shadow-premium-lg whitespace-nowrap flex items-center gap-2"
              >
                <Scan className="w-4 h-4" />
                Analyze New Image
              </button>
            </div>

            {/* TABS Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-muted/50 p-1 rounded-xl flex gap-1">
                <button
                  onClick={() => setActiveTab("segmentation")}
                  className={`px - 6 py - 2.5 rounded - lg font - semibold text - sm transition - all duration - 300 flex items - center gap - 2 ${activeTab === "segmentation"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    } `}
                >
                  <Layers className="w-4 h-4" />
                  Segmentation
                </button>
                <button
                  onClick={() => setActiveTab("classification")}
                  className={`px - 6 py - 2.5 rounded - lg font - semibold text - sm transition - all duration - 300 flex items - center gap - 2 ${activeTab === "classification"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    } `}
                >
                  <Activity className="w-4 h-4" />
                  Classification
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Segmentation */}
            {activeTab === "segmentation" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                {/* Original Image */}
                <div className="space-y-4 group">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-foreground text-lg">Original Image</h3>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-3 shadow-premium transition-all duration-300 group-hover:shadow-premium-lg group-hover:border-primary/20">
                    <div className="relative overflow-hidden rounded-xl bg-muted/50">
                      <img src={uploadedImageUrl} alt="Original" className="w-full h-auto object-contain" />
                    </div>
                  </div>
                </div>

                {/* Generated Mask */}
                <div className="space-y-4 group">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-foreground text-lg">Generated Mask</h3>
                    <button
                      onClick={() => downloadImage(segmentationResult.mask, "segmentation-mask.png")}
                      className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-3 shadow-premium transition-all duration-300 group-hover:shadow-premium-lg group-hover:border-primary/20">
                    <div className="relative overflow-hidden rounded-xl bg-muted/50">
                      <img src={segmentationResult.mask} alt="Mask" className="w-full h-auto object-contain" />
                    </div>
                  </div>
                </div>

                {/* Segmented Object */}
                <div className="space-y-4 group">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-foreground text-lg">Segmented Object</h3>
                    <button
                      onClick={() => downloadImage(segmentationResult.maskedImage, "segmented-object.png")}
                      className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-3 shadow-premium transition-all duration-300 group-hover:shadow-premium-lg group-hover:border-primary/20">
                    <div className="relative overflow-hidden rounded-xl bg-muted/50">
                      <img src={segmentationResult.maskedImage} alt="Segmented" className="w-full h-auto object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Classification */}
            {activeTab === "classification" && (
              <div className="max-w-3xl mx-auto animate-fade-in">
                <div className="relative overflow-hidden bg-card border border-border rounded-3xl shadow-2xl transition-all hover:shadow-primary/5">
                  {/* Decorative Background */}
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent opacity-50" />

                  <div className="relative p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

                      {/* Left Side: Icon & Visual */}
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="relative mb-4">
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-primary/10 shadow-inner">
                            <Activity className="w-16 h-16 text-primary" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-card p-2 rounded-full shadow-lg border border-border">
                            <CheckCircle className="w-8 h-8 text-emerald-500 fill-emerald-500/20" />
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Details */}
                      <div className="flex-1 text-center md:text-left space-y-6">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-3">
                            <Zap className="w-3 h-3" /> AI Analysis
                          </div>
                          <h2 className="text-5xl md:text-6xl font-black text-foreground tracking-tight leading-none">
                            Class <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">{classificationResult.class_id}</span>
                          </h2>
                          <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
                            The image has been successfully classified by the ResNet50 model.
                          </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-muted/40 p-4 rounded-2xl border border-border/50 hover:border-primary/20 transition-colors">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Model Architecture</p>
                            <p className="text-lg font-bold text-foreground flex items-center gap-2">
                              ResNet50
                              <span className="text-xs bg-foreground/10 px-2 py-0.5 rounded text-foreground/70">v1.0</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
