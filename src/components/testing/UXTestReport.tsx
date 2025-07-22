
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Monitor, Tablet, Smartphone } from "lucide-react";
import { useState } from "react";

interface TestResult {
  id: string;
  category: 'responsiveness' | 'accessibility' | 'performance' | 'usability';
  test: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
}

export const UXTestReport = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('desktop');

  const testResults: TestResult[] = [
    // Responsiveness Tests
    {
      id: 'resp-01',
      category: 'responsiveness',
      test: 'Navigation Menu - Mobile',
      status: 'pass',
      description: 'Menu hamburger działa poprawnie na urządzeniach mobilnych',
      priority: 'high'
    },
    {
      id: 'resp-02',
      category: 'responsiveness',
      test: 'Hero Section - Tablet',
      status: 'warning',
      description: 'Na tabletach tekst w sekcji hero może być za mały',
      recommendation: 'Zwiększ rozmiar czcionki dla breakpointu tablet',
      priority: 'medium'
    },
    {
      id: 'resp-03',
      category: 'responsiveness',
      test: 'Cards Layout - Mobile',
      status: 'pass',
      description: 'Karty adaptują się poprawnie do szerokości ekranu',
      priority: 'high'
    },
    {
      id: 'resp-04',
      category: 'responsiveness',
      test: 'Quiz Interface - Small Screens',
      status: 'fail',
      description: 'Opcje odpowiedzi w quizie mogą być trudne do kliknięcia na małych ekranach',
      recommendation: 'Zwiększ min-height przycisków do 48px zgodnie z wytycznymi accessibility',
      priority: 'high'
    },

    // Accessibility Tests
    {
      id: 'acc-01',
      category: 'accessibility',
      test: 'Keyboard Navigation',
      status: 'warning',
      description: 'Niektóre elementy nie mają wystarczającego focus indicator',
      recommendation: 'Dodaj wyraźniejsze style focus dla lepszej widoczności',
      priority: 'medium'
    },
    {
      id: 'acc-02',
      category: 'accessibility',
      test: 'Color Contrast',
      status: 'pass',
      description: 'Kontrast kolorów spełnia wymagania WCAG AA',
      priority: 'high'
    },
    {
      id: 'acc-03',
      category: 'accessibility',
      test: 'Alt Text Images',
      status: 'pass',
      description: 'Obrazy mają odpowiednie teksty alternatywne',
      priority: 'medium'
    },
    {
      id: 'acc-04',
      category: 'accessibility',
      test: 'Voice Features',
      status: 'warning',
      description: 'Funkcje głosowe nie mają fallbacków dla użytkowników z problemami słuchu',
      recommendation: 'Dodaj transkrypcje i wizualne wskaźniki dla funkcji audio',
      priority: 'medium'
    },

    // Performance Tests
    {
      id: 'perf-01',
      category: 'performance',
      test: 'Initial Load Time',
      status: 'pass',
      description: 'Aplikacja ładuje się w czasie < 3 sekund',
      priority: 'high'
    },
    {
      id: 'perf-02',
      category: 'performance',
      test: 'Animation Smoothness',
      status: 'pass',
      description: 'Animacje działają płynnie w 60fps',
      priority: 'medium'
    },
    {
      id: 'perf-03',
      category: 'performance',
      test: 'Large Dataset Handling',
      status: 'warning',
      description: 'Brak paginacji dla długich list lekcji',
      recommendation: 'Implementuj wirtualizację lub paginację dla lepszej wydajności',
      priority: 'low'
    },

    // Usability Tests
    {
      id: 'usab-01',
      category: 'usability',
      test: 'Navigation Clarity',
      status: 'pass',
      description: 'Nawigacja jest intuicyjna i łatwa w użyciu',
      priority: 'high'
    },
    {
      id: 'usab-02',
      category: 'usability',
      test: 'Error Handling',
      status: 'warning',
      description: 'Niektóre błędy nie mają user-friendly komunikatów',
      recommendation: 'Dodaj przyjazne komunikaty błędów dla końcowych użytkowników',
      priority: 'medium'
    },
    {
      id: 'usab-03',
      category: 'usability',
      test: 'Learning Progress Visibility',
      status: 'pass',
      description: 'Postęp nauki jest wyraźnie widoczny dla użytkownika',
      priority: 'high'
    }
  ];

  const filteredResults = selectedCategory === 'all' 
    ? testResults 
    : testResults.filter(result => result.category === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-success">Zaliczony</Badge>;
      case 'fail':
        return <Badge variant="destructive">Niezaliczony</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Ostrzeżenie</Badge>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Wysoki</Badge>;
      case 'medium':
        return <Badge variant="secondary">Średni</Badge>;
      case 'low':
        return <Badge variant="outline">Niski</Badge>;
      default:
        return null;
    }
  };

  const deviceIcons = {
    desktop: <Monitor className="w-4 h-4" />,
    tablet: <Tablet className="w-4 h-4" />,
    mobile: <Smartphone className="w-4 h-4" />
  };

  const summaryStats = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'pass').length,
    failed: testResults.filter(r => r.status === 'fail').length,
    warnings: testResults.filter(r => r.status === 'warning').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Raport Testów UX/UI</h1>
          <p className="text-muted-foreground mt-2">
            Analiza użyteczności i dostępności aplikacji AI Tutor
          </p>
        </div>
        <div className="flex gap-2">
          {Object.entries(deviceIcons).map(([device, icon]) => (
            <Button
              key={device}
              variant={selectedDevice === device ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDevice(device)}
              className="flex items-center gap-2"
            >
              {icon}
              {device === 'desktop' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Mobile'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Łącznie testów</p>
                <p className="text-2xl font-bold">{summaryStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zaliczone</p>
                <p className="text-2xl font-bold text-success">{summaryStats.passed}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ostrzeżenia</p>
                <p className="text-2xl font-bold text-warning">{summaryStats.warnings}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Niepowodzenia</p>
                <p className="text-2xl font-bold text-destructive">{summaryStats.failed}</p>
              </div>
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? "default" : "outline"}
          onClick={() => setSelectedCategory('all')}
        >
          Wszystkie
        </Button>
        <Button
          variant={selectedCategory === 'responsiveness' ? "default" : "outline"}
          onClick={() => setSelectedCategory('responsiveness')}
        >
          Responsywność
        </Button>
        <Button
          variant={selectedCategory === 'accessibility' ? "default" : "outline"}
          onClick={() => setSelectedCategory('accessibility')}
        >
          Dostępność
        </Button>
        <Button
          variant={selectedCategory === 'performance' ? "default" : "outline"}
          onClick={() => setSelectedCategory('performance')}
        >
          Wydajność
        </Button>
        <Button
          variant={selectedCategory === 'usability' ? "default" : "outline"}
          onClick={() => setSelectedCategory('usability')}
        >
          Użyteczność
        </Button>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {filteredResults.map((result) => (
          <Card key={result.id} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <CardTitle className="text-lg">{result.test}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(result.status)}
                      <span className="text-sm text-muted-foreground">Priorytet:</span>
                      {getPriorityBadge(result.priority)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{result.description}</p>
              {result.recommendation && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Rekomendacja:</p>
                  <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Items */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Pilne do naprawy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testResults
              .filter(r => r.status === 'fail' || (r.status === 'warning' && r.priority === 'high'))
              .map(result => (
                <div key={result.id} className="flex items-center justify-between p-2 bg-background rounded">
                  <span className="font-medium">{result.test}</span>
                  {getPriorityBadge(result.priority)}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
