import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, BookOpen, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useContentAnalysis } from "@/hooks/useContentAnalysis";

const ContentImportPage = () => {
  const { stats, loading, error } = useContentAnalysis();

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Ładowanie analizy treści...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">Błąd ładowania danych: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Analiza brakujących umiejętności
        </h1>
        <div className="text-xl text-muted-foreground">
          {stats.missingContent === 0 ? (
            <span className="text-green-600 font-bold">
              🎉 Wszystkie umiejętności mają treść!
            </span>
          ) : (
            <span>
              <strong className="text-red-600">{stats.missingContent} umiejętności</strong> wymaga uzupełnienia treści
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Stan bazy: {stats.withContent}/{stats.total} umiejętności ma pełną zawartość ({Math.round((stats.withContent/stats.total)*100)}% pokrycia)
        </div>
      </div>

      {stats.missingContent === 0 ? (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              Baza danych jest kompletna!
            </h2>
            <p className="text-green-700 dark:text-green-300">
              Wszystkie {stats.total} umiejętności w systemie mają kompletną treść edukacyjną.
            </p>
            <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✅ <strong>Pochodna funkcji — definicja, obliczanie, interpretacje</strong> - w bazie<br/>
                ✅ <strong>Stereometria — objętości i pola powierzchni</strong> - w bazie
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Krytyczne</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.critical.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Wysoki priorytet</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.highPriority.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Pozostałe</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.remaining.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Razem brakuje</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.missingContent}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Skills Section */}
          <Card className="mb-6 border-red-200 dark:border-red-800">
            <CardHeader className="bg-red-50 dark:bg-red-950/20">
              <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                <AlertTriangle className="h-5 w-5" />
                PRIORYTET KRYTYCZNY
                <Badge variant="destructive" className="ml-2">
                  {stats.critical.length} umiejętności
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {stats.critical.length === 0 ? (
                <div className="text-center py-8 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">Wszystkie krytyczne umiejętności mają treść!</p>
                </div>
              ) : (
                stats.critical.map((skill, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          skill.class_level <= 3 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {skill.class_level <= 3 ? 'LICEUM' : 'PODSTAWÓWKA'}
                        </span>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Klasa {skill.class_level}
                        </span>
                      </div>
                      <div className="font-medium text-red-900 dark:text-red-100">
                        {skill.name}
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {skill.department}
                      </div>
                    </div>
                    <div className="ml-4 text-xs text-red-500 dark:text-red-500 font-medium">
                      BRAK TREŚCI
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* High Priority Skills Section */}
          <Card className="mb-6 border-orange-200 dark:border-orange-800">
            <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
              <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                <Users className="h-5 w-5" />
                PRIORYTET WYSOKI
                <Badge variant="secondary" className="ml-2 bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                  {stats.highPriority.length} umiejętności
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {stats.highPriority.length === 0 ? (
                <div className="text-center py-8 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">Wszystkie wysokopriorytetowe umiejętności mają treść!</p>
                </div>
              ) : (
                stats.highPriority.map((skill, index) => (
                  <div key={index} className="flex items-start justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          skill.class_level <= 3 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {skill.class_level <= 3 ? 'LICEUM' : 'PODSTAWÓWKA'}
                        </span>
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          Klasa {skill.class_level}
                        </span>
                      </div>
                      <div className="font-medium text-orange-900 dark:text-orange-100 text-sm">
                        {skill.name}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {skill.department}
                      </div>
                    </div>
                    <div className="ml-4 text-xs text-orange-500 dark:text-orange-500">
                      BRAK TREŚCI
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Remaining Skills Section */}
          <Card className="mb-6 border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <BookOpen className="h-5 w-5" />
                POZOSTAŁE UMIEJĘTNOŚCI
                <Badge variant="outline" className="ml-2 border-blue-300 dark:border-blue-700">
                  {stats.remaining.length} umiejętności
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {stats.remaining.length === 0 ? (
                <div className="text-center py-8 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-medium">Wszystkie pozostałe umiejętności mają treść!</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {stats.remaining.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          skill.class_level <= 3 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {skill.class_level <= 3 ? 'LICEUM' : 'PODSTAWÓWKA'}
                        </span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">{skill.name}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">Klasa {skill.class_level} • {skill.department}</span>
                      </div>
                      <span className="text-xs text-blue-500 dark:text-blue-500">BRAK TREŚCI</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <CheckCircle className="h-5 w-5" />
            Podsumowanie stanu bazy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.missingContent}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Umiejętności bez treści</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.withContent}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Umiejętności z treścią</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Wszystkie umiejętności</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentImportPage;