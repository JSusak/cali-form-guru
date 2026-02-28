import { Link } from "react-router-dom";
import { Upload, Video } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-display font-bold tracking-tight mb-3">
          Cali<span className="text-primary">Buddy</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your personalised calisthenics &amp; aerial coach, anywhere and everywhere!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link to="/upload">
            <Card className="group cursor-pointer border-2 border-transparent hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardContent className="flex flex-col items-center gap-4 p-8">
                <div className="rounded-2xl bg-accent p-4 group-hover:bg-primary/10 transition-colors">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-display font-semibold mb-1">Upload Video</h2>
                  <p className="text-sm text-muted-foreground">
                    Get a detailed score &amp; feedback on your form
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Link to="/coach">
            <Card className="group cursor-pointer border-2 border-transparent hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardContent className="flex flex-col items-center gap-4 p-8">
                <div className="rounded-2xl bg-accent p-4 group-hover:bg-primary/10 transition-colors">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-display font-semibold mb-1">Live Coach</h2>
                  <p className="text-sm text-muted-foreground">
                    Real-time AI voice feedback as you train
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
