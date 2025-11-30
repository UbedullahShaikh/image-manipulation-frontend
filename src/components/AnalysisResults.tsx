import { useState } from "react";
import { CheckCircle, Scan, Layers, Activity, Download, Zap } from "lucide-react";

interface AnalysisResultsProps {
    uploadedImageUrl: string;
    segmentationResult: {
        mask: string;
        maskedImage: string;
    };
    classificationResult: {
        class_id: number;
        confidence: number;
    };
    onClearImage: () => void;
}

export default function AnalysisResults({
    uploadedImageUrl,
    segmentationResult,
    classificationResult,
    onClearImage,
}: AnalysisResultsProps) {
    const [activeTab, setActiveTab] = useState<"segmentation" | "classification">("segmentation");

    const downloadImage = (dataUrl: string, filename: string) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
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
                    onClick={onClearImage}
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/40 p-4 rounded-2xl border border-border/50 hover:border-primary/20 transition-colors">
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Model Architecture</p>
                                            <p className="text-lg font-bold text-foreground flex items-center gap-2">
                                                ResNet50
                                                <span className="text-xs bg-foreground/10 px-2 py-0.5 rounded text-foreground/70">v1.0</span>
                                            </p>
                                        </div>
                                        {/* <div className="bg-muted/40 p-4 rounded-2xl border border-border/50 hover:border-primary/20 transition-colors">
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Confidence Score</p>
                                            <div className="flex items-center gap-3">
                                                <div className="h-2.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${(classificationResult.confidence * 100).toFixed(1)}% ` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    {(classificationResult.confidence * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
