import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckSquare, FileText, ChevronRight } from 'lucide-react';

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: string;
  path: string;
  color: string;
  bgColor: string;
}

const features: FeatureCard[] = [
  {
    icon: PlayCircle,
    title: 'Lekcje wideo',
    description: 'Ogladaj krotkie filmy z wyjasnieniami',
    path: '/learn',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    icon: CheckSquare,
    title: 'Quizy',
    description: 'Sprawdz wiedze w interaktywnych testach',
    path: '/learn',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    icon: FileText,
    title: 'Materialy',
    description: 'Pobierz notatki i sciagi',
    path: '/learn',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10'
  }
];

export const FeatureCards = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Eksploruj</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="hover:shadow-md transition-all cursor-pointer group"
            onClick={() => navigate(feature.path)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{feature.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
