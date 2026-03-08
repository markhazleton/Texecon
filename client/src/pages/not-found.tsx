import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="w-full flex items-center justify-center py-20 bg-muted/20">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The page you requested does not exist or may have moved.
          </p>
          <a href="/" className="inline-block mt-5 text-sm text-primary hover:text-primary/80">
            Return to TexEcon home
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
