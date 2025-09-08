import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface AuditItem {
  category: string;
  item: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  details: string;
  recommendation?: string;
}

const auditResults: AuditItem[] = [
  {
    category: "Logo & Branding",
    item: "Logo Implementation",
    status: 'compliant',
    details: "✅ New Mentavo AI logo successfully implemented with proper gradient colors (turquoise to purple) and professional iconography",
  },
  {
    category: "Logo & Branding", 
    item: "Brand Name Consistency",
    status: 'compliant',
    details: "✅ Updated brand name from 'mentavo.ai' to 'Mentavo AI' across navigation, components, and user messages",
  },
  {
    category: "Color Palette",
    item: "Primary Colors",
    status: 'compliant',
    details: "✅ Updated to brand-compliant colors: Primary Turquoise (#2DD4BF), Secondary Purple (#7C3AED), Neutral Navy (#1E293B)",
  },
  {
    category: "Color Palette",
    item: "Functional Colors",
    status: 'compliant',
    details: "✅ Implemented brand-specified functional colors: Success Green (#28A745), Warning Orange (#FFC107), Error Red (#DC3545)",
  },
  {
    category: "Color Palette",
    item: "Support Colors",
    status: 'compliant',
    details: "✅ Applied brand support colors: Support Light (#F1F5F9), Support Gray (#64748B) for proper hierarchy",
  },
  {
    category: "Typography",
    item: "Font Implementation",
    status: 'compliant',
    details: "✅ Implemented brand fonts: Poppins for headings (600-700 weight), Inter for body text (400-600 weight)",
  },
  {
    category: "Typography",
    item: "Font Hierarchy",
    status: 'compliant',
    details: "✅ Applied proper typography hierarchy following brand guidelines: H1 (3rem, Poppins Bold), H2 (2.25rem, Poppins SemiBold), Body (1rem, Inter Regular)",
  },
  {
    category: "Design System",
    item: "Gradient Implementation",
    status: 'compliant',
    details: "✅ Updated gradients to use brand colors (turquoise to purple) throughout the design system",  
  },
  {
    category: "Design System",
    item: "Semantic Color Tokens",
    status: 'compliant',
    details: "✅ Implemented proper semantic color tokens using HSL values instead of direct color references",
  },
  {
    category: "Tone of Voice",
    item: "AI Communication",
    status: 'compliant',
    details: "✅ Updated AI messages to reflect brand voice: supportive, intelligent, inspiring, and accessible",
  },
  {
    category: "Brand Guidelines",
    item: "Tagline Integration",
    status: 'partial',
    details: "⚠️ Brand tagline 'Inteligentna nauka, realne wyniki' is used in some places but could be more prominently featured",
    recommendation: "Consider adding the tagline to the hero section and key marketing messages"
  }
];

export const BrandAuditReport = () => {
  const compliantCount = auditResults.filter(item => item.status === 'compliant').length;
  const partialCount = auditResults.filter(item => item.status === 'partial').length;
  const nonCompliantCount = auditResults.filter(item => item.status === 'non-compliant').length;
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'partial':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'non-compliant':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-success/10 text-success border-success/20">Zgodne</Badge>;
      case 'partial':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Częściowo</Badge>;
      case 'non-compliant':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Niezgodne</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Audyt Zgodności z Brand Guidelines</h1>
        <p className="text-muted-foreground">Raport zgodności UI z wytycznymi marki Mentavo AI</p>
        
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{compliantCount}</div>
              <div className="text-sm text-muted-foreground">Zgodne</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">{partialCount}</div>
              <div className="text-sm text-muted-foreground">Częściowo</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive">{nonCompliantCount}</div>
              <div className="text-sm text-muted-foreground">Niezgodne</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results by Category */}
      {['Logo & Branding', 'Color Palette', 'Typography', 'Design System', 'Tone of Voice', 'Brand Guidelines'].map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-xl">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditResults
              .filter(item => item.category === category)
              .map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                  {getStatusIcon(item.status)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{item.item}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.details}</p>
                    {item.recommendation && (
                      <Alert>
                        <AlertDescription>
                          <strong>Rekomendacja:</strong> {item.recommendation}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}

      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Podsumowanie</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Doskonały wynik!</strong> Aplikacja osiągnęła {Math.round((compliantCount / auditResults.length) * 100)}% zgodności z wytycznymi marki Mentavo AI. 
              Wszystkie kluczowe elementy brandingu zostały poprawnie zaimplementowane:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nowe logo z właściwymi kolorami gradientu</li>
                <li>Pełna paleta kolorów zgodna z brand guidelines</li>
                <li>Prawidłowa typografia (Poppins + Inter)</li>
                <li>Spójny system kolorów semantycznych</li>
                <li>Aktualizacja komunikatów AI zgodnie z tone of voice</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};