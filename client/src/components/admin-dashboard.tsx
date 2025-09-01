import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Clock,
  Globe,
  Database,
  Zap
} from 'lucide-react';
import ContentValidatorUI from './content-validator-ui';
import ErrorMonitor from './error-monitor';
import { useContentMonitoring } from '@/hooks/use-content-monitoring';

export default function AdminDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const { 
    validationResult, 
    isValidating, 
    lastCheck, 
    runValidation, 
    healthScore, 
    status,
    hasErrors,
    hasWarnings 
  } = useContentMonitoring({
    autoValidate: true,
    validationInterval: 5 * 60 * 1000, // 5 minutes
    enableRealTimeChecks: true
  });

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <Shield className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getHealthColor = () => {
    if (healthScore >= 90) return 'text-green-600';
    if (healthScore >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="sm"
          data-testid="button-show-admin"
        >
          <Activity className="w-4 h-4 mr-2" />
          Monitor
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-background/95 backdrop-blur-sm rounded-lg shadow-2xl border overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Content Monitoring Dashboard</h2>
            <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
              {getStatusIcon()}
              {status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Health Score: <span className={`font-bold ${getHealthColor()}`}>{healthScore}%</span>
            </div>
            <Button
              onClick={() => setIsVisible(false)}
              variant="outline"
              size="sm"
              data-testid="button-hide-admin"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold">Content Status</div>
                        <div className="text-sm text-muted-foreground capitalize">{status}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-semibold">Health Score</div>
                        <div className={`text-sm font-bold ${getHealthColor()}`}>{healthScore}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-semibold">Last Check</div>
                        <div className="text-sm text-muted-foreground">
                          {lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={runValidation}
                    disabled={isValidating}
                    className="w-full"
                    data-testid="button-quick-validate"
                  >
                    {isValidating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Validating Content...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Run Full Validation
                      </>
                    )}
                  </Button>
                  
                  {hasErrors && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">
                          {validationResult?.errors.length} critical issues detected
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {hasWarnings && !hasErrors && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">
                          {validationResult?.warnings.length} warnings to review
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <ContentValidatorUI />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Real-time Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Auto-validation</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Check Interval</span>
                        <Badge variant="secondary">5 minutes</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Real-time Detection</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Last Validation</span>
                        <span className="text-sm text-muted-foreground">
                          {lastCheck ? lastCheck.toLocaleString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <ErrorMonitor />
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Automated Testing Suite</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="text-lg font-semibold mb-2">Comprehensive Testing</h3>
                      <p className="text-muted-foreground mb-4">
                        Automated tests for content validation, SEO compliance, and data integrity.
                      </p>
                    </div>
                    
                    {/* Test Categories */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="font-medium text-sm">Content Tests</div>
                        <div className="text-xs text-muted-foreground">API data, navigation, team profiles</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="font-medium text-sm">SEO Tests</div>
                        <div className="text-xs text-muted-foreground">Meta tags, structured data, performance</div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={runValidation}
                      disabled={isValidating}
                      className="w-full"
                      data-testid="button-run-full-tests"
                    >
                      {isValidating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Running Tests...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Run All Tests
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}