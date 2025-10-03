import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Download, 
  Key, 
  Book, 
  Zap,
  Copy,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PartnerDocs = () => {
  const { toast } = useToast();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    setTimeout(() => setCopiedEndpoint(null), 2000);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const endpoints = [
    {
      method: "GET",
      path: "/vault-search",
      description: "Search M.E Models in the vault",
      params: ["q (required)", "modality", "limit"]
    },
    {
      method: "GET",
      path: "/partner-api/models/{id}",
      description: "Get specific model details",
      params: ["model_id (path)"]
    },
    {
      method: "POST",
      path: "/partner-api/licenses",
      description: "Create a new license",
      params: ["model_id", "licensee_email", "license_type"]
    },
    {
      method: "GET",
      path: "/partner-api/usage",
      description: "Get usage statistics",
      params: ["model_id (optional)"]
    },
    {
      method: "POST",
      path: "/partner-api/usage",
      description: "Record usage event",
      params: ["model_id", "license_id", "usage_metadata"]
    }
  ];

  const codeExamples = {
    curl: `curl -X GET "https://thnusgshpnktmphivphf.supabase.co/functions/v1/vault-search?q=vocal" \\
  -H "x-api-key: YOUR_API_KEY"`,
    javascript: `const response = await fetch(
  'https://thnusgshpnktmphivphf.supabase.co/functions/v1/vault-search?q=vocal',
  {
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  }
);
const data = await response.json();`,
    python: `import requests

response = requests.get(
    'https://thnusgshpnktmphivphf.supabase.co/functions/v1/vault-search',
    params={'q': 'vocal'},
    headers={'x-api-key': 'YOUR_API_KEY'}
)
data = response.json()`
  };

  const websocketExample = `// Connect to real-time training endpoint
const ws = new WebSocket(
  'wss://thnusgshpnktmphivphf.supabase.co/functions/v1/training-realtime',
  {
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  }
);

ws.onopen = () => {
  // Start training session
  ws.send(JSON.stringify({
    type: 'start_training',
    data: {
      model_id: 'MODEL_UUID',
      session_type: 'fine-tuning',
      metadata: {}
    }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'training_progress') {
    console.log('Progress:', message.progress + '%');
  } else if (message.type === 'training_complete') {
    console.log('Training complete!');
  }
};`;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Partner API Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Integrate M.E Models™ into your platform with our comprehensive API
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Authentication</div>
                <div className="font-semibold">API Key</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rate Limit</div>
                <div className="font-semibold">60/min</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Format</div>
                <div className="font-semibold">REST + WebSocket</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Book className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Version</div>
                <div className="font-semibold">v1.0.0</div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4">
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="openapi">OpenAPI</TabsTrigger>
          </TabsList>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
              <p className="text-muted-foreground mb-6">
                All endpoints require authentication via the <code className="text-primary">x-api-key</code> header.
              </p>
              
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <Card key={index} className="p-4 border-border/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={endpoint.method === 'GET' ? 'default' : 'secondary'}
                          className="font-mono"
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                      >
                        {copiedEndpoint === endpoint.path ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {endpoint.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <strong>Parameters:</strong> {endpoint.params.join(', ')}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
              
              <Tabs defaultValue="curl">
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>

                {Object.entries(codeExamples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm">{code}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(code, `${lang} example`)}
                      >
                        {copiedEndpoint === `${lang} example` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          </TabsContent>

          {/* Real-time Tab */}
          <TabsContent value="realtime" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Real-time Training API</h2>
              <p className="text-muted-foreground mb-6">
                Use WebSockets to submit training data and receive real-time progress updates.
              </p>

              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{websocketExample}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(websocketExample, "WebSocket example")}
                >
                  {copiedEndpoint === "WebSocket example" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Message Types</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-mono">start_training</code>
                    <span className="text-sm text-muted-foreground ml-2">- Initiate training session</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-mono">upload_chunk</code>
                    <span className="text-sm text-muted-foreground ml-2">- Upload training data chunk</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-mono">training_progress</code>
                    <span className="text-sm text-muted-foreground ml-2">- Progress update (server → client)</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm font-mono">training_complete</code>
                    <span className="text-sm text-muted-foreground ml-2">- Training finished (server → client)</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* OpenAPI Tab */}
          <TabsContent value="openapi" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">OpenAPI Specification</h2>
              <p className="text-muted-foreground mb-6">
                Download our OpenAPI spec to generate SDKs for your preferred language.
              </p>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/openapi.json';
                    link.download = 'artistvault-api-spec.json';
                    link.click();
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download OpenAPI Spec
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://editor.swagger.io/', '_blank')}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Open in Swagger Editor
                </Button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">SDK Generation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use tools like OpenAPI Generator to create client SDKs:
                </p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
{`# Generate TypeScript SDK
npx @openapitools/openapi-generator-cli generate \\
  -i openapi.json \\
  -g typescript-fetch \\
  -o ./sdk

# Generate Python SDK
openapi-generator-cli generate \\
  -i openapi.json \\
  -g python \\
  -o ./sdk`}
                  </code>
                </pre>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerDocs;
