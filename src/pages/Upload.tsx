import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload as UploadIcon, Loader2, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PoseSelector } from "@/components/PoseSelector";
import { ScoreGauge } from "@/components/ScoreGauge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  score: number;
  corrections: string[];
  praise: string[];
  tips: string[];
}

const UploadPage = () => {
  const [selectedPose, setSelectedPose] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({ variant: "destructive", title: "Please upload a video file" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File must be under 20MB" });
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setResult(null);
  }, [toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!videoFile || !selectedPose) {
      toast({ variant: "destructive", title: "Please select a video and a pose" });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert video to base64 for the AI
      const buffer = await videoFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const { data, error } = await supabase.functions.invoke("analyze-pose", {
        body: {
          videoBase64: base64,
          mimeType: videoFile.type,
          poseName: selectedPose,
        },
      });

      if (error) throw error;
      setResult(data as AnalysisResult);
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({ variant: "destructive", title: "Analysis failed", description: err.message || "Please try again" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setResult(null);
    setSelectedPose("");
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-3xl font-display font-bold mb-6">Upload Video</h1>

      {/* Pose selector */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">What pose were you attempting?</label>
        <PoseSelector value={selectedPose} onChange={setSelectedPose} />
      </div>

      {/* Drop zone */}
      {!videoPreview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors mb-6"
        >
          <UploadIcon className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Drag & drop your video or tap to browse</p>
          <p className="text-xs text-muted-foreground">Max 20MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="mb-6">
          <video
            src={videoPreview}
            controls
            className="w-full rounded-xl border border-border"
            style={{ maxHeight: 300 }}
          />
          <div className="flex gap-2 mt-3">
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !selectedPose} className="flex-1">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                "Analyze My Form"
              )}
            </Button>
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-center py-4">
              <ScoreGauge score={result.score} />
            </div>

            {result.corrections.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-score-red" /> What to Correct
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {result.corrections.map((c, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {c}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.praise.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-score-green" /> What You Did Well
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {result.praise.map((p, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {p}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.tips.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-score-yellow" /> How to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {result.tips.map((t, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {t}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Button variant="outline" onClick={reset} className="w-full">
              Analyze Another Video
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;
