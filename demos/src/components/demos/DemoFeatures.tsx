interface DemoFeaturesProps {
  title?: string;
  features: string[];
}

/**
 * Reusable component for "Key Features" or "Key Benefits" sections
 */
export function DemoFeatures({ title = "💡 Key Features:", features }: DemoFeaturesProps) {
  return (
    <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
      <p className="font-medium mb-2">{title}</p>
      <ul className="space-y-1 list-disc list-inside">
        {features.map((feature, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: feature }} />
        ))}
      </ul>
    </div>
  );
}
