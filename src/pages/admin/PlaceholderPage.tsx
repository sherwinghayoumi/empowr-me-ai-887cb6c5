import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <Card className="bg-card/80 border-border/50">
        <CardContent className="py-16 text-center">
          <Construction className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">In Entwicklung</h3>
          <p className="text-muted-foreground text-sm">
            {description || `Die ${title}-Seite wird in einem kommenden Update verfügbar sein.`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
