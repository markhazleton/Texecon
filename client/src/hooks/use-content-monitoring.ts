import { useState, useEffect, useCallback } from 'react';
import ContentValidator, { ValidationResult } from '@/lib/content-validator';
import { realContent } from '@/lib/data';

interface ContentMonitoringConfig {
  autoValidate?: boolean;
  validationInterval?: number; // in milliseconds
  enableRealTimeChecks?: boolean;
}

export function useContentMonitoring(config: ContentMonitoringConfig = {}) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [validator] = useState(() => new ContentValidator());

  const {
    autoValidate = true,
    validationInterval = 5 * 60 * 1000, // 5 minutes
    enableRealTimeChecks = true
  } = config;

  const runValidation = useCallback(async () => {
    if (isValidating) return;
    
    setIsValidating(true);
    try {
      const result = await validator.validateContent(realContent);
      const freshnessResult = await validator.validateFreshness(realContent);
      
      const combinedResult: ValidationResult = {
        isValid: result.isValid && freshnessResult.isValid,
        errors: [...result.errors, ...freshnessResult.errors],
        warnings: [...result.warnings, ...freshnessResult.warnings],
        timestamp: result.timestamp
      };
      
      setValidationResult(combinedResult);
      setLastCheck(new Date());
      
      // Log issues in development
      if (process.env.NODE_ENV === 'development') {
        if (combinedResult.errors.length > 0) {
          console.warn('Content validation errors:', combinedResult.errors);
        }
        if (combinedResult.warnings.length > 0) {
          console.info('Content validation warnings:', combinedResult.warnings);
        }
      }
      
    } catch (error) {
      console.error('Content validation failed:', error);
      setValidationResult({
        isValid: false,
        errors: [`Validation system error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        timestamp: new Date().toISOString()
      });
      setLastCheck(new Date());
    } finally {
      setIsValidating(false);
    }
  }, [validator, isValidating]);

  // Auto-validation on mount and interval
  useEffect(() => {
    if (autoValidate) {
      runValidation();
      
      if (validationInterval > 0) {
        const interval = setInterval(runValidation, validationInterval);
        return () => clearInterval(interval);
      }
    }
  }, [autoValidate, validationInterval, runValidation]);

  // Real-time content change detection
  useEffect(() => {
    if (!enableRealTimeChecks) return;

    const observer = new MutationObserver((mutations) => {
      const hasContentChanges = mutations.some(mutation => 
        mutation.type === 'childList' || 
        (mutation.type === 'attributes' && mutation.attributeName === 'data-testid')
      );
      
      if (hasContentChanges) {
        // Debounce validation checks
        setTimeout(runValidation, 2000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-testid', 'src', 'href']
    });

    return () => observer.disconnect();
  }, [enableRealTimeChecks, runValidation]);

  const getHealthScore = useCallback(() => {
    if (!validationResult) return 0;
    
    const totalIssues = validationResult.errors.length + validationResult.warnings.length;
    if (totalIssues === 0) return 100;
    
    const errorWeight = validationResult.errors.length * 10;
    const warningWeight = validationResult.warnings.length * 2;
    const totalWeight = errorWeight + warningWeight;
    
    return Math.max(0, 100 - totalWeight);
  }, [validationResult]);

  const getStatus = useCallback(() => {
    if (!validationResult) return 'unknown';
    if (validationResult.errors.length > 0) return 'error';
    if (validationResult.warnings.length > 0) return 'warning';
    return 'healthy';
  }, [validationResult]);

  return {
    validationResult,
    isValidating,
    lastCheck,
    runValidation,
    healthScore: getHealthScore(),
    status: getStatus(),
    hasErrors: validationResult?.errors.length ?? 0 > 0,
    hasWarnings: validationResult?.warnings.length ?? 0 > 0
  };
}