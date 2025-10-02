import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PackageManager = 'npm' | 'yarn' | 'pnpm';

interface CommandDisplayProps {
  command: string;
  onCopy: () => void;
  copied: boolean;
}

function CommandDisplay({ command, onCopy, copied }: CommandDisplayProps) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-mono">bash</span>
        <Button
          onClick={onCopy}
          variant="ghost"
          size="sm"
          className="h-8 px-2 transition-colors cursor-pointer"
          title={copied ? 'Copied!' : 'Copy command'}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code className="text-sm font-mono">{command}</code>
      </pre>
    </div>
  );
}

export function InstallationSection() {
  const [activeTab, setActiveTab] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState(false);

  const installCommands: Record<PackageManager, string> = {
    npm: 'npm install use-time-hooks',
    yarn: 'yarn add use-time-hooks',
    pnpm: 'pnpm add use-time-hooks',
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const tabs: PackageManager[] = ['npm', 'yarn', 'pnpm'];

  return (
    <div className="mb-12 mx-auto max-w-3xl">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>

        {/* Custom Tabs */}
        <div className="inline-flex rounded-lg border bg-muted p-1">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-2 py-1 text-sm font-medium rounded-md transition-all cursor-pointer
                ${
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Command Display */}
        <CommandDisplay
          command={installCommands[activeTab]}
          onCopy={() => handleCopy(installCommands[activeTab])}
          copied={copied}
        />
      </div>
    </div>
  );
}
