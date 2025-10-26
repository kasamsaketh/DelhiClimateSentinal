import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Wind, Leaf, Factory, Users, BookOpen } from "lucide-react";

interface Article {
  category: string;
  title: string;
  excerpt: string;
  icon: typeof Wind;
  color: string;
  tips: string[];
}

const articles: Article[] = [
  {
    category: "Air Quality",
    title: "10 Ways to Reduce Air Pollution in Urban Areas",
    excerpt: "Simple daily actions that contribute to cleaner air for everyone in the community.",
    icon: Wind,
    color: "text-blue-500",
    tips: [
      "Use public transportation, carpool, or bike whenever possible",
      "Plant trees and maintain green spaces in your neighborhood",
      "Avoid burning waste or leaves",
      "Support clean energy initiatives and renewable power sources",
      "Reduce indoor air pollution by using natural cleaning products"
    ]
  },
  {
    category: "Water Conservation",
    title: "Smart Water Management for Households",
    excerpt: "Effective strategies to conserve water and prevent scarcity in our communities.",
    icon: Droplets,
    color: "text-cyan-500",
    tips: [
      "Fix leaky faucets and pipes immediately to prevent water waste",
      "Install low-flow showerheads and dual-flush toilets",
      "Collect rainwater for gardening and non-potable uses",
      "Use water-efficient appliances and dishwashers",
      "Water plants early morning or late evening to reduce evaporation"
    ]
  },
  {
    category: "Sustainable Living",
    title: "Creating an Eco-Friendly Lifestyle",
    excerpt: "Practical steps to reduce your environmental footprint and promote sustainability.",
    icon: Leaf,
    color: "text-green-500",
    tips: [
      "Reduce single-use plastics by using reusable bags and containers",
      "Compost organic waste to reduce landfill burden",
      "Buy local and seasonal produce to reduce carbon footprint",
      "Switch to energy-efficient LED lighting",
      "Practice the 3 R's: Reduce, Reuse, Recycle"
    ]
  },
  {
    category: "Industrial Impact",
    title: "Understanding Industrial Pollution Prevention",
    excerpt: "How communities can advocate for cleaner industrial practices.",
    icon: Factory,
    color: "text-orange-500",
    tips: [
      "Support businesses with strong environmental policies",
      "Advocate for stricter emissions regulations",
      "Report illegal dumping or pollution to authorities",
      "Encourage industries to adopt cleaner technologies",
      "Participate in environmental impact assessments"
    ]
  },
  {
    category: "Community Action",
    title: "Building Environmental Awareness Together",
    excerpt: "Collective efforts make the biggest impact on environmental health.",
    icon: Users,
    color: "text-purple-500",
    tips: [
      "Organize community clean-up drives and awareness campaigns",
      "Create neighborhood watch programs for environmental violations",
      "Educate children about environmental responsibility",
      "Share knowledge and resources with neighbors",
      "Collaborate with local NGOs and environmental groups"
    ]
  },
  {
    category: "Education",
    title: "Environmental Literacy for All Ages",
    excerpt: "Resources and knowledge to understand environmental challenges better.",
    icon: BookOpen,
    color: "text-pink-500",
    tips: [
      "Stay informed about local environmental policies and issues",
      "Attend workshops and seminars on sustainability",
      "Use environmental monitoring apps and tools",
      "Read scientific reports on climate and pollution",
      "Share credible environmental information on social media"
    ]
  }
];

export function KnowledgeInsights() {
  return (
    <section className="w-full bg-gradient-to-b from-background via-muted/30 to-background py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="text-sm" data-testid="badge-section-knowledge">
            Knowledge & Insights
          </Badge>
          <h2 className="text-4xl font-bold text-foreground">
            Prevention & Best Practices
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover actionable insights and proven strategies to combat pollution, 
            conserve water, and build a sustainable future for our communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => {
            const Icon = article.icon;
            return (
              <Card
                key={index}
                className="p-6 space-y-4 hover-elevate active-elevate-2 transition-all h-full flex flex-col"
                data-testid={`card-article-${index}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-md bg-muted ${article.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {article.category}
                    </Badge>
                    <h3 className="text-lg font-semibold text-card-foreground leading-tight">
                      {article.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {article.excerpt}
                </p>

                <div className="flex-1 space-y-2 pt-2">
                  <h4 className="text-sm font-semibold text-foreground">Key Actions:</h4>
                  <ul className="space-y-2">
                    {article.tips.slice(0, 3).map((tip, tipIndex) => (
                      <li
                        key={tipIndex}
                        className="text-xs text-muted-foreground flex items-start gap-2"
                        data-testid={`tip-${index}-${tipIndex}`}
                      >
                        <span className="text-primary mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  {article.tips.length > 3 && (
                    <p className="text-xs text-muted-foreground/60 italic pt-1">
                      +{article.tips.length - 3} more tips
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 p-8 rounded-lg bg-card border border-border">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-card-foreground">
              Join the Movement
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every small action counts. Together, we can create lasting change and build 
              resilient, sustainable communities for future generations.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <Badge variant="outline" data-testid="badge-community">Community-Driven</Badge>
              <Badge variant="outline" data-testid="badge-science">Science-Based</Badge>
              <Badge variant="outline" data-testid="badge-action">Action-Oriented</Badge>
              <Badge variant="outline" data-testid="badge-future">Sustainable Future</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
