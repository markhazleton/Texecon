export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

export class AutomatedTester {
  async runContentTests(data: any): Promise<TestSuite> {
    const startTime = Date.now();
    const tests: TestResult[] = [];

    // Test 1: API Data Structure
    tests.push(await this.testApiDataStructure(data));
    
    // Test 2: Navigation Menu Integrity
    tests.push(await this.testNavigationIntegrity(data));
    
    // Test 3: Team Member Data Completeness
    tests.push(await this.testTeamDataCompleteness(data));
    
    // Test 4: SEO Meta Data Presence
    tests.push(await this.testSeoMetaData());

    const endTime = Date.now();
    const passed = tests.filter(t => t.passed).length;
    const failed = tests.filter(t => !t.passed).length;

    return {
      name: 'Content Validation Suite',
      tests,
      passed,
      failed,
      duration: endTime - startTime
    };
  }

  private async testApiDataStructure(data: any): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const hasMetadata = data.metadata && typeof data.metadata === 'object';
      const hasTeam = Array.isArray(data.team);
      const hasNavigation = Array.isArray(data.navigation);
      
      const passed = hasMetadata && hasTeam && hasNavigation;
      
      return {
        name: 'API Data Structure',
        passed,
        message: passed ? 'All required data sections present' : 'Missing required data sections',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'API Data Structure',
        passed: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async testNavigationIntegrity(data: any): Promise<TestResult> {
    const startTime = Date.now();
    try {
      if (!data.navigation || !Array.isArray(data.navigation)) {
        return {
          name: 'Navigation Integrity',
          passed: false,
          message: 'Navigation data missing or invalid',
          duration: Date.now() - startTime
        };
      }

      const hasValidItems = data.navigation.every((item: any) => 
        item.id && item.title && typeof item.id === 'number' && typeof item.title === 'string'
      );

      return {
        name: 'Navigation Integrity',
        passed: hasValidItems,
        message: hasValidItems ? `${data.navigation.length} navigation items valid` : 'Invalid navigation items found',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Navigation Integrity',
        passed: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async testTeamDataCompleteness(data: any): Promise<TestResult> {
    const startTime = Date.now();
    try {
      if (!data.team || !Array.isArray(data.team)) {
        return {
          name: 'Team Data Completeness',
          passed: false,
          message: 'Team data missing',
          duration: Date.now() - startTime
        };
      }

      const completeMembers = data.team.filter((member: any) =>
        member.name && member.title && member.description && member.image
      );

      const passed = completeMembers.length === data.team.length;

      return {
        name: 'Team Data Completeness',
        passed,
        message: `${completeMembers.length}/${data.team.length} team members have complete data`,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Team Data Completeness',
        passed: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async testContentHtmlValidity(data: any): Promise<TestResult> {
    const startTime = Date.now();
    try {
      let invalidHtmlCount = 0;
      
      if (data.navigation) {
        data.navigation.forEach((item: any) => {
          if (item.content && typeof item.content === 'string') {
            // Basic HTML validation - check for unclosed tags
            const tempDiv = document.createElement('div');
            try {
              tempDiv.innerHTML = item.content;
            } catch (error) {
              invalidHtmlCount++;
            }
          }
        });
      }

      return {
        name: 'Content HTML Validity',
        passed: invalidHtmlCount === 0,
        message: invalidHtmlCount === 0 ? 'All HTML content is valid' : `${invalidHtmlCount} items with invalid HTML`,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Content HTML Validity',
        passed: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async testExternalResources(data: any): Promise<TestResult> {
    const startTime = Date.now();
    try {
      // Test Mark Hazleton's image specifically
      const markHazleton = data.team?.find((member: any) => member.id === 'mark-hazleton');
      
      if (!markHazleton || !markHazleton.image) {
        return {
          name: 'External Resources',
          passed: false,
          message: 'Mark Hazleton image not found',
          duration: Date.now() - startTime
        };
      }

      try {
        const response = await fetch(markHazleton.image, { method: 'HEAD' });
        const passed = response.ok;
        
        return {
          name: 'External Resources',
          passed,
          message: passed ? 'Key external resources accessible' : `Mark's image not accessible (${response.status})`,
          duration: Date.now() - startTime
        };
      } catch (error) {
        return {
          name: 'External Resources',
          passed: false,
          message: 'Could not validate external resources',
          duration: Date.now() - startTime
        };
      }
    } catch (error) {
      return {
        name: 'External Resources',
        passed: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async testSeoMetaData(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const hasTitle = document.title && document.title.length > 0;
      const hasDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
      const hasOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const hasCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      
      const seoElements = [hasTitle, hasDescription, hasOgImage, hasCanonical].filter(Boolean).length;
      const passed = seoElements >= 3;

      return {
        name: 'SEO Meta Data',
        passed,
        message: `${seoElements}/4 essential SEO elements present`,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'SEO Meta Data',
        passed: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  private async testPerformanceMetrics(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      // Check if performance observer is available
      const hasPerformanceAPI = 'PerformanceObserver' in window;
      
      // Check for optimized images (lazy loading)
      const images = document.querySelectorAll('img');
      const optimizedImages = Array.from(images).filter(img => 
        img.loading === 'lazy' || img.getAttribute('loading') === 'lazy'
      ).length;
      
      const passed = hasPerformanceAPI && optimizedImages > 0;

      return {
        name: 'Performance Optimization',
        passed,
        message: passed ? `${optimizedImages} images optimized, performance monitoring active` : 'Performance optimizations missing',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: 'Performance Optimization',
        passed: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime
      };
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Automated Content Testing</h3>
        <Button 
          onClick={runValidation}
          disabled={isValidating}
          size="sm"
          data-testid="button-run-tests"
        >
          {isValidating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {validationResult && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Test Results Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {validationResult.isValid && validationResult.errors.length === 0 && validationResult.warnings.length === 0 ? '✓' : 
                     validationResult.errors.length === 0 ? validationResult.warnings.length : validationResult.errors.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {validationResult.errors.length === 0 ? 'All Passed' : 'Issues Found'}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Date(validationResult.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Last Check</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {validationResult.errors.map((error, index) => (
                  <div key={`error-${index}`} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                ))}
                {validationResult.warnings.map((warning, index) => (
                  <div key={`warning-${index}`} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{warning}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}