import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock } from "lucide-react";
import ContentValidator, { ValidationResult } from "@/lib/content-validator";
import { realContent } from "@/lib/data";

export default function ContentValidatorUI() {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<string | null>(null);
  const [validator] = useState(() => new ContentValidator());

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const result = await validator.validateContent(realContent);
      const freshnessResult = await validator.validateFreshness(realContent);

      // Combine results
      const combinedResult: ValidationResult = {
        isValid: result.isValid && freshnessResult.isValid,
        errors: [...result.errors, ...freshnessResult.errors],
        warnings: [...result.warnings, ...freshnessResult.warnings],
        timestamp: result.timestamp,
      };

      setValidationResult(combinedResult);
      setLastValidation(new Date().toLocaleString());
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`],
        warnings: [],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Run initial validation on mount
  useEffect(() => {
    runValidation();
  }, []);

  const getStatusIcon = () => {
    if (!validationResult) return <Clock className="w-5 h-5" />;
    if (validationResult.isValid) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusText = () => {
    if (!validationResult) return "Pending";
    if (validationResult.isValid) return "Valid";
    return "Issues Found";
  };

  const getStatusColor = () => {
    if (!validationResult) return "secondary";
    if (validationResult.isValid) return "default";
    return "destructive";
  };

  return (
    <Card className="w-full" data-testid="content-validator">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Content Validation
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor() as any}>{getStatusText()}</Badge>
            <Button
              onClick={runValidation}
              disabled={isValidating}
              size="sm"
              variant="outline"
              data-testid="button-validate"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Validate
                </>
              )}
            </Button>
          </div>
        </div>
        {lastValidation && (
          <p className="text-sm text-muted-foreground">Last validated: {lastValidation}</p>
        )}
      </CardHeader>

      <CardContent>
        {validationResult && (
          <div className="space-y-4">
            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <Alert variant="destructive" data-testid="validation-errors">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Errors Found:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <Alert variant="default" data-testid="validation-warnings">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Warnings:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success state */}
            {validationResult.isValid &&
              validationResult.errors.length === 0 &&
              validationResult.warnings.length === 0 && (
                <Alert data-testid="validation-success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All content validation checks passed successfully! Content is valid and
                    up-to-date.
                  </AlertDescription>
                </Alert>
              )}

            {/* Validation summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {validationResult.errors.length === 0 ? "✓" : validationResult.errors.length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {validationResult.warnings.length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {validationResult.isValid ? "✓" : "✗"}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
