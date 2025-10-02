import { useState } from 'react';
import { useDelayedState } from 'use-time-hooks';
import { Button } from '@/components/ui/button';
import { CodeExample } from '../CodeExample';
import { DemoHeader } from '../DemoHeader';
import { DemoCard } from '../DemoCard';
import { DemoInstructions } from '../DemoInstructions';
import { DemoFeatures } from '../DemoFeatures';
import { CheckCircle, Clock, Save, X } from 'lucide-react';

export function DelayedStateDemo() {
  const [content, setContent] = useState('');
  const delayedState = useDelayedState('', 2000);
  const {
    value: savedContent,
    immediateValue,
    setValue: setSavedContent,
    isPending: isDelayed,
    setImmediate: flush,
    cancel,
    timeRemaining,
  } = delayedState;

  const [notificationMessage, setNotificationMessage] = useState('');
  const notificationState = useDelayedState('', 1500);
  const {
    value: delayedNotification,
    setValue: setDelayedNotification,
    timeRemaining: notificationTimeRemaining,
  } = notificationState;

  const handleContentChange = (value: string) => {
    setContent(value);
    setSavedContent(value);
  };

  const handleSaveNow = () => {
    flush(content);
  };

  const handleCancelSave = () => {
    cancel();
  };

  const showNotification = (message: string) => {
    setNotificationMessage(message);
    setDelayedNotification(`✅ ${message} (confirmed)`);
  };

  const handleQuickAction = () => {
    showNotification('Quick action performed!');
  };

  const handleCancelNotification = () => {
    notificationState.cancel();
    setNotificationMessage('Action cancelled');
  };

  const isSaved = content === savedContent && !isDelayed;
  const hasUnsavedChanges = content !== savedContent || isDelayed;

  const exampleCode = `import { useDelayedState } from 'use-time-hooks';

function AutoSaveEditor() {
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent, { isDelayed, flush }] = 
    useDelayedState('', 2000);

  const handleChange = (value) => {
    setContent(value);
    setSavedContent(value); // Will save after 2s delay
  };

  const saveNow = () => flush(); // Save immediately

  return (
    <div>
      <textarea 
        value={content}
        onChange={(e) => handleChange(e.target.value)}
      />
      <p>Status: {isDelayed ? 'Saving...' : 'Saved'}</p>
      <button onClick={saveNow}>Save Now</button>
    </div>
  );
}`;

  return (
    <div className="space-y-8">
      <DemoHeader
        title="useDelayedState"
        description="Manage state with delayed updates, perfect for auto-save functionality and optimistic UI"
      />

      <DemoCard>
        <div className="space-y-6">
          {/* Auto-Save Example */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Auto-Save Text Editor</h3>

            <div className="space-y-2">
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start typing... Content will auto-save after 2 seconds"
                className="w-full h-32 p-3 border rounded-md resize-none"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {isDelayed && (
                      <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
                    )}
                    {isSaved && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span>
                      Status:{' '}
                      {isDelayed && (
                        <span className="text-orange-600">
                          Auto-saving in {(timeRemaining / 1000).toFixed(1)}s...
                        </span>
                      )}
                      {isSaved && (
                        <span className="text-green-600">✅ Saved</span>
                      )}
                      {hasUnsavedChanges && !isDelayed && (
                        <span className="text-red-600">❌ Unsaved changes</span>
                      )}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {hasUnsavedChanges && (
                      <Button onClick={handleSaveNow} size="sm">
                        <Save className="h-3 w-3 mr-1" />
                        Save Now
                      </Button>
                    )}
                    {isDelayed && (
                      <Button
                        onClick={handleCancelSave}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Show immediate vs delayed values */}
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <div>
                    Immediate value: "{immediateValue}" (updates instantly)
                  </div>
                  <div>
                    Delayed value: "{savedContent}" (updates after 2s delay)
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <div>Current: {content.length} characters</div>
                <div>Saved: {savedContent.length} characters</div>
              </div>
            </div>
          </div>

          {/* Notification Example */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Delayed Notifications
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleQuickAction}>Perform Action</Button>
                {notificationState.isPending && (
                  <Button onClick={handleCancelNotification} variant="outline">
                    Cancel Confirmation
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {notificationMessage && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
                    <div className="flex items-center gap-2">
                      <span>Immediate: {notificationMessage}</span>
                    </div>
                  </div>
                )}

                {delayedNotification && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
                    <div className="flex items-center gap-2">
                      {notificationState.isPending && (
                        <Clock className="h-4 w-4 animate-pulse" />
                      )}
                      <span>
                        Delayed: {delayedNotification}
                        {notificationState.isPending && (
                          <span className="ml-2 text-sm">
                            (confirming in{' '}
                            {(notificationTimeRemaining / 1000).toFixed(1)}s...)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DemoInstructions
            steps={[
              '<strong>Start Typing:</strong> Type in the input field and watch the "Current Input" update instantly.',
              '<strong>Watch the Delay:</strong> The "Saved Value" (green box) waits 2 seconds before updating. The countdown shows time remaining.',
              '<strong>Try Save Now:</strong> Click "Save Now" to bypass the delay and save immediately.',
              '<strong>Try Cancel:</strong> Make changes, then click "Cancel" to revert back to the last saved value.',
              '<strong>Observe Pending State:</strong> The orange "Pending..." indicator shows when changes are waiting to be saved.',
            ]}
          />

          <DemoFeatures
            features={[
              '<strong>Dual State:</strong> Immediate value for UI responsiveness + delayed value for actual state updates',
              '<strong>Auto-save:</strong> Automatically commits changes after a delay period (great for draft saving)',
              '<strong>Manual Control:</strong> Save immediately or cancel pending changes at any time',
              '<strong>Countdown Timer:</strong> Visual feedback showing time until auto-save',
              '<strong>Use Cases:</strong> Auto-saving forms, search inputs, draft editors, settings panels',
            ]}
          />
        </div>
      </DemoCard>

      <CodeExample code={exampleCode} />
    </div>
  );
}
