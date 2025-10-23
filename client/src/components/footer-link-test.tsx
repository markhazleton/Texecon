import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import FooterLinkValidator from "@/lib/footer-link-validator";

interface LinkValidationResult {
  link: string;
  isValid: boolean;
  type: "internal" | "external" | "section";
  status?: number;
  message: string;
}

interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  validationRate: number;
  byType: {
    internal: LinkValidationResult[];
    external: LinkValidationResult[];
    section: LinkValidationResult[];
  };
}

export default function FooterLinkTest() {
  const [validationResults, setValidationResults] = useState<LinkValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const validator = FooterLinkValidator.getInstance();
      const results = await validator.validateAllFooterLinks();
      const summary = validator.getValidationSummary(results);

      setValidationResults(results);
      setSummary(summary);
    } catch (error) {
      console.error("Footer link validation failed:", error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "external":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "internal":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "section":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card data-testid="footer-link-test">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Footer Link Validation
          </CardTitle>
          <Button
            onClick={runValidation}
            disabled={isValidating}
            size="sm"
            variant="outline"
            data-testid="button-validate-footer-links"
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Validate Links
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {summary && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <div className="text-2xl font-bold text-green-600">{summary.valid}</div>
                <div className="text-sm text-muted-foreground">Valid</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{summary.invalid}</div>
                <div className="text-sm text-muted-foreground">Invalid</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{summary.validationRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {validationResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
              data-testid={`link-result-${index}`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(result.isValid)}
                <div>
                  <div className="font-medium text-sm">{result.link}</div>
                  <div className="text-xs text-muted-foreground">{result.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.status && (
                  <Badge variant="outline" className="text-xs">
                    {result.status}
                  </Badge>
                )}
                <Badge className={`text-xs ${getTypeColor(result.type)}`}>{result.type}</Badge>
              </div>
            </div>
          ))}
        </div>

        {validationResults.length === 0 && !isValidating && (
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No validation results yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
