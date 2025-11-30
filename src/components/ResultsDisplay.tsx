"use client";

import { Sparkles, TrendingUp } from "lucide-react";

interface ClassificationResult {
    label: string;
    confidence: number;
}

interface ResultsDisplayProps {
    detectedObjects: string[];
    modelsUsed: string[];
    classificationResults?: ClassificationResult[];
}

export default function ResultsDisplay({
    detectedObjects,
    modelsUsed,
    classificationResults = [],
}: ResultsDisplayProps) {
    return (
        <div className="w-full space-y-4 animate-fade-in">
            {/* Info Card */}
            <div className="p-5 bg-card border border-border rounded-xl shadow-premium-lg">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">Detection</h3>
                        <p className="text-sm text-foreground">
                            {detectedObjects.join(", ")}
                        </p>
                    </div>
                </div>
                <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Models:</span> {modelsUsed.join(" & ")}
                    </p>
                </div>
            </div>

            {/* Classification Cards */}
            {classificationResults.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground px-1">
                        Classification
                    </h3>
                    {classificationResults.map((result, index) => (
                        <div
                            key={index}
                            className="p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all duration-300 shadow-premium hover:shadow-premium-lg"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <h4 className="font-semibold text-foreground">{result.label}</h4>
                                </div>
                                <span className="text-lg font-bold text-primary">
                                    {(result.confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-primary transition-all duration-700 rounded-full"
                                    style={{
                                        width: `${result.confidence * 100}%`,
                                        transitionDelay: `${index * 150}ms`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
