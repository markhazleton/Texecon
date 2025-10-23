import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, Clock } from "lucide-react";

interface ErrorReport {
  id: string;
  type: "content" | "api" | "performance" | "validation";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  resolved?: boolean;
  context?: Record<string, unknown>;
}

export default function ErrorMonitor() {
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const isMonitoring = true;

  const addError = useCallback((errorData: Omit<ErrorReport, "id" | "timestamp">) => {
    const newError: ErrorReport = {
      ...errorData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setErrors((prev) => [newError, ...prev.slice(0, 49)]); // Keep last 50 errors
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    // Monitor console errors
    const originalError = console.error;
    console.error = (...args) => {
      originalError.apply(console, args);

      const errorMessage = args.join(" ");
      addError({
        type: "content",
        severity: "high",
        message: errorMessage,
        context: { source: "console" },
      });
    };

    // Monitor unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError({
        type: "api",
        severity: "critical",
        message: `Unhandled promise rejection: ${event.reason}`,
        context: { source: "promise" },
      });
    };

    // Monitor JavaScript errors
    const handleError = (event: ErrorEvent) => {
      addError({
        type: "content",
        severity: "high",
        message: `${event.message} at ${event.filename}:${event.lineno}`,
        context: { source: "javascript", filename: event.filename, line: event.lineno },
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    // Cleanup
    return () => {
      console.error = originalError;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, [isMonitoring, addError]);

  const clearErrors = () => {
    setErrors([]);
  };

  const resolveError = (id: string) => {
    setErrors((prev) =>
      prev.map((error) => (error.id === id ? { ...error, resolved: true } : error))
    );
  };

  const getSeverityColor = (severity: ErrorReport["severity"]) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
    }
  };

  const getSeverityIcon = (severity: ErrorReport["severity"]) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4" />;
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4" />;
      case "low":
        return <Clock className="w-4 h-4" />;
    }
  };

  const activeErrors = errors.filter((e) => !e.resolved);
  const criticalErrors = activeErrors.filter((e) => e.severity === "critical");

  return (
    <Card data-testid="error-monitor">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Error Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={activeErrors.length > 0 ? "destructive" : "default"}>
              {activeErrors.length} Active
            </Badge>
            <Button
              onClick={clearErrors}
              size="sm"
              variant="outline"
              disabled={errors.length === 0}
              data-testid="button-clear-errors"
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activeErrors.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">✓</div>
            <p className="text-sm text-muted-foreground">No active errors detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Critical alerts */}
            {criticalErrors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {criticalErrors.length} critical error{criticalErrors.length > 1 ? "s" : ""}{" "}
                  detected that may affect site functionality
                </AlertDescription>
              </Alert>
            )}

            {/* Error list */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeErrors.slice(0, 10).map((error) => (
                <div
                  key={error.id}
                  className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                  data-testid={`error-${error.id}`}
                >
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(error.severity)}
                    <Badge
                      variant={
                        getSeverityColor(error.severity) as
                          | "default"
                          | "destructive"
                          | "outline"
                          | "secondary"
                      }
                      className="text-xs"
                    >
                      {error.severity}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{error.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {error.timestamp.toLocaleTimeString()} • {error.type}
                    </p>
                  </div>
                  <Button
                    onClick={() => resolveError(error.id)}
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    data-testid={`button-resolve-${error.id}`}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>

            {activeErrors.length > 10 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing 10 of {activeErrors.length} errors
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
