import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PoseSelector } from "@/components/PoseSelector";
import { ScoreGauge } from "@/components/ScoreGauge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackEntry {
  text: string;
  timestamp: number;
}

const CoachPage = () => {
  const [selectedPose, setSelectedPose] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
  }, []);

  const speakFeedback = useCallback(async (text: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );
      if (!response.ok) return;
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
    }
  }, []);

  const analyzeFrame = useCallback(async () => {
    const frameBase64 = captureFrame();
    if (!frameBase64) return;

    try {
      const { data, error } = await supabase.functions.invoke("analyze-pose", {
        body: {
          imageBase64: frameBase64,
          mimeType: "image/jpeg",
          poseName: selectedPose,
          liveMode: true,
        },
      });

      if (error) throw error;
      if (data?.feedback) {
        setFeedback((prev) => [...prev, { text: data.feedback, timestamp: Date.now() }]);
        speakFeedback(data.feedback);
      }
      if (data?.score != null) {
        setBestScore((prev) => (prev === null ? data.score : Math.max(prev, data.score)));
      }
    } catch (err) {
      console.error("Live analysis error:", err);
    }
  }, [captureFrame, selectedPose, speakFeedback]);

  const startSession = async () => {
    if (!selectedPose) {
      toast({ variant: "destructive", title: "Please select a pose first" });
      return;
    }

    setIsStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsSessionActive(true);
      setSessionEnded(false);
      setFeedback([]);
      setBestScore(null);

      // Analyze every 6 seconds
      intervalRef.current = setInterval(analyzeFrame, 6000);
      // First analysis after 2 seconds
      setTimeout(analyzeFrame, 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Camera access required", description: "Please allow camera access to use Live Coach" });
    } finally {
      setIsStarting(false);
    }
  };

  const stopSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsSessionActive(false);
    setSessionEnded(true);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-3xl font-display font-bold mb-6">Live Coach</h1>

      {!isSessionActive && !sessionEnded && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">What pose will you practice?</label>
            <PoseSelector value={selectedPose} onChange={setSelectedPose} />
          </div>
          <Button onClick={startSession} disabled={isStarting || !selectedPose} className="w-full" size="lg">
            {isStarting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Starting Camera...</>
            ) : (
              <><Video className="h-4 w-4" /> Start Live Coach</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            The AI will watch you through your camera and give spoken feedback. You don't need to look at the screen.
          </p>
        </div>
      )}

      {/* Camera view */}
      {isSessionActive && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-border">
            <video ref={videoRef} autoPlay playsInline muted className="w-full" style={{ maxHeight: 350 }} />
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-score-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-score-green"></span>
              </span>
              <span className="text-xs font-medium">AI Watching</span>
            </div>
          </div>

          <Button variant="destructive" onClick={stopSession} className="w-full" size="lg">
            Stop Session
          </Button>

          {/* Live transcript */}
          {feedback.length > 0 && (
            <Card>
              <CardContent className="p-4 max-h-48 overflow-y-auto space-y-2">
                {feedback.map((f, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-muted-foreground"
                  >
                    <span className="text-primary font-medium">Coach:</span> {f.text}
                  </motion.p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Session summary */}
      <AnimatePresence>
        {sessionEnded && bestScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mt-4"
          >
            <h2 className="text-xl font-display font-semibold text-center">Session Summary</h2>
            <div className="flex justify-center">
              <ScoreGauge score={bestScore} />
            </div>
            <p className="text-center text-sm text-muted-foreground">Your best score this session</p>

            {feedback.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-medium mb-2">Feedback History</p>
                  {feedback.map((f, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {f.text}</p>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button onClick={() => { setSessionEnded(false); setSelectedPose(""); }} className="w-full">
              Start New Session
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CoachPage;
