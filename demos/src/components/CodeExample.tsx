import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface CodeExampleProps {
  title?: string;
  code: string;
  language?: string;
}

export function CodeExample({
  title = 'Code Example',
  code,
  language = 'tsx',
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      if (theme === 'system') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(theme === 'dark');
      }
    };

    checkDarkMode();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="rounded-lg border bg-muted/50 p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">{title}</h3>
          <span className="text-xs font-mono px-2 py-1 rounded bg-primary/10 text-primary">
            {language}
          </span>
        </div>
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 transition-colors"
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 hover:text-primary" />
          )}
        </Button>
      </div>
      <div className="relative overflow-hidden rounded-md">
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            background: isDark ? '#1e1e1e' : '#fafafa',
          }}
          showLineNumbers={false}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
