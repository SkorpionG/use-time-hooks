interface DemoInstructionsProps {
  steps: string[];
}

/**
 * Reusable component for "How to use this demo" sections
 */
export function DemoInstructions({ steps }: DemoInstructionsProps) {
  return (
    <div className="text-sm p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
      <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">📖 How to use this demo:</p>
      <ol className="space-y-2 list-decimal list-inside text-blue-800 dark:text-blue-200">
        {steps.map((step, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: step }} />
        ))}
      </ol>
    </div>
  );
}
