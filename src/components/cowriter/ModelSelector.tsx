import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  User,
  Check,
  Music,
  Sparkles,
  X
} from "lucide-react";

interface VoiceModel {
  id: string;
  model_name: string;
  canonical_name: string;
  description: string;
  artist_name: string;
}

interface ModelSelectorProps {
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
  onlyUserModels?: boolean; // When true, only show user's own models
}

const ModelSelector = ({ selectedModels, onModelsChange, onlyUserModels = false }: ModelSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchModels = async (query: string) => {
    if (!query.trim()) {
      setModels([]);
      return;
    }

    setLoading(true);
    try {
      // Get current user if filtering to only user models
      let currentUserId = null;
      if (onlyUserModels) {
        const { data: { user } } = await supabase.auth.getUser();
        currentUserId = user?.id;
      }

      let queryBuilder = supabase
        .from('me_models')
        .select(`
          id,
          model_name,
          canonical_name,
          description,
          artists (
            artist_name,
            user_id
          )
        `)
        .eq('is_active', true)
        .or(`model_name.ilike.%${query}%,canonical_name.ilike.%${query}%`)
        .limit(10);

      const { data, error } = await queryBuilder;

      if (error) throw error;

      let filteredData = data || [];
      
      // Filter to only user's models if required
      if (onlyUserModels && currentUserId) {
        filteredData = filteredData.filter(model => 
          model.artists?.user_id === currentUserId
        );
      }

      const formattedModels = filteredData.map(model => ({
        id: model.id,
        model_name: model.model_name,
        canonical_name: model.canonical_name,
        description: model.description || '',
        artist_name: model.artists?.artist_name || 'Unknown Artist',
      }));

      setModels(formattedModels);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search voice models",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        searchModels(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const toggleModel = (modelName: string) => {
    if (onlyUserModels) {
      // When onlyUserModels is true, only allow selecting one model
      onModelsChange([modelName]);
    } else {
      // Normal multi-select behavior
      if (selectedModels.includes(modelName)) {
        onModelsChange(selectedModels.filter(m => m !== modelName));
      } else {
        onModelsChange([...selectedModels, modelName]);
      }
    }
  };

  const removeModel = (modelName: string) => {
    onModelsChange(selectedModels.filter(m => m !== modelName));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">M.E Models™ Selector</h3>
      </div>

      {/* Selected Models */}
      {selectedModels.length > 0 && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Active Models ({selectedModels.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedModels.map((modelName) => (
                <Badge
                  key={modelName}
                  className="bg-primary/20 text-primary flex items-center gap-1"
                >
                  <Music className="w-3 h-3" />
                  {modelName}
                  <button
                    onClick={() => removeModel(modelName)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={onlyUserModels ? "Search your M.E Models™..." : "Search M.E Models™ from Artist Vault..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <Card className="p-4 border-border/50 bg-card/50 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Searching...
            </p>
          ) : models.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No models found. Try a different search term.
            </p>
          ) : (
            <div className="space-y-2">
              {models.map((model) => {
                const isSelected = selectedModels.includes(model.model_name);
                return (
                  <div
                    key={model.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50 hover:bg-accent/5'
                    }`}
                    onClick={() => toggleModel(model.model_name)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-medium">{model.model_name}</h4>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {model.artist_name}
                        </p>
                        {model.description && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {model.description.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Info */}
      <Card className="p-3 border-border/50 bg-accent/5">
        <p className="text-xs text-muted-foreground">
          {onlyUserModels 
            ? "🔒 You can only select and update your own M.E Models™ for security purposes."
            : "💡 Selected M.E Models™ will influence the AI's generation style and can be used as vocal agents in your co-writing session."
          }
        </p>
      </Card>
    </div>
  );
};

export default ModelSelector;
