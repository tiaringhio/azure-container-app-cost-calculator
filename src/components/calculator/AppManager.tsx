import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { ContainerApp } from '../../types/calculator';

interface AppManagerProps {
  apps: ContainerApp[];
  activeAppId: string | null;
  onAddApp: (name?: string) => void;
  onRemoveApp: (appId: string) => void;
  onSetActiveApp: (appId: string) => void;
  onUpdateAppName: (appId: string, name: string) => void;
  estimateName: string;
  onUpdateEstimateName: (name: string) => void;
}

export const AppManager: React.FC<AppManagerProps> = ({
  apps,
  activeAppId,
  onAddApp,
  onRemoveApp,
  onSetActiveApp,
  onUpdateAppName,
  estimateName,
  onUpdateEstimateName
}) => {
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [editingEstimateName, setEditingEstimateName] = useState(false);
  const [tempEstimateName, setTempEstimateName] = useState('');

  const startEditing = (app: ContainerApp) => {
    setEditingAppId(app.id);
    setEditingName(app.name);
  };

  const saveEdit = () => {
    if (editingAppId && editingName.trim()) {
      onUpdateAppName(editingAppId, editingName.trim());
    }
    setEditingAppId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingAppId(null);
    setEditingName('');
  };

  const addNewApp = () => {
    const name = newAppName.trim() || undefined;
    onAddApp(name);
    setNewAppName('');
  };

  const startEditingEstimate = () => {
    setEditingEstimateName(true);
    setTempEstimateName(estimateName);
  };

  const saveEstimateName = () => {
    if (tempEstimateName.trim()) {
      onUpdateEstimateName(tempEstimateName.trim());
    }
    setEditingEstimateName(false);
    setTempEstimateName('');
  };

  const cancelEstimateEdit = () => {
    setEditingEstimateName(false);
    setTempEstimateName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          {editingEstimateName ? (
            <div className="flex items-center gap-2">
              <input
                value={tempEstimateName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempEstimateName(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, saveEstimateName)}
                onBlur={saveEstimateName}
                className="text-xl font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0 flex-1 min-w-0 focus:outline-none max-w-full"
                autoFocus
              />
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={saveEstimateName}
                  className="h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cancelEstimateEdit}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <CardTitle 
              className="text-xl cursor-pointer hover:underline"
              onClick={startEditingEstimate}
              title="Click to edit estimate name"
            >
              {estimateName}
            </CardTitle>
          )}
          <p className="text-sm text-muted-foreground">
            {apps.length} app{apps.length !== 1 ? 's' : ''}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Apps List */}
        <div className="space-y-2">
          {apps.map((app) => (
            <div
              key={app.id}
              className={`group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-muted/50 ${
                activeAppId === app.id 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                  : 'border-border'
              }`}
              onClick={() => {
                if (editingAppId !== app.id) {
                  onSetActiveApp(app.id);
                }
              }}
            >
              {/* Color indicator */}
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: app.color }}
              />

              {/* App name - takes most of the space */}
              <div className="flex-1 min-w-0 overflow-hidden">
                {editingAppId === app.id ? (
                  <div className="flex items-center gap-1 w-full">
                    <input
                      value={editingName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, saveEdit)}
                      onBlur={saveEdit}
                      className="text-sm h-7 sm:h-8 min-w-0 flex-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-full"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEdit();
                      }}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEdit();
                      }}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center w-full">
                    <span 
                      className="font-medium text-sm cursor-text hover:underline flex-1 min-w-0 break-words"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(app);
                      }}
                      title={app.name}
                    >
                      {app.name}
                    </span>
                    {/* Delete button - only visible on hover and if more than 1 app */}
                    {apps.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveApp(app.id);
                        }}
                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 sm:transition-opacity sm:duration-200 ml-1 flex-shrink-0 touch:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add new app */}
        <div className="flex items-center gap-2">
          <input
            placeholder="App name..."
            value={newAppName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAppName(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyPress(e, addNewApp)}
            className="text-sm flex-1 min-w-0 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 sm:px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-full"
          />
          <Button
            onClick={addNewApp}
            size="sm"
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
