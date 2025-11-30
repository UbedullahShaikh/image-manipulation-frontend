import { Scan } from "lucide-react";

export default function HeroSection() {
    return (
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
    );
}
