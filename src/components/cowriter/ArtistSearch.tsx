import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Users,
  MapPin,
  Star,
  Music,
  Mic,
  Guitar,
  Piano,
  Drum,
  Headphones,
  PlayCircle,
  MessageSquare,
  ExternalLink,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { OpenPlayAPI, Artist as OpenPlayArtist } from "@/integrations/openplay/OpenPlayAPI";
import { Artist } from './types';

// Extended Artist interface that combines OpenPlay data with CoWriter-specific fields
interface ExtendedArtist extends OpenPlayArtist {
  availability: 'available' | 'busy' | 'offline';
  responseTime: string;
  hourlyRate?: number;
  isOnline: boolean;
}

interface ArtistSearchProps {
  openPlayAPI: OpenPlayAPI | null;
  onArtistSelect: (artist: Artist) => void;
  onStartSession: (artist: Artist) => void;
}

// Mock data for demo purposes
const mockArtists: Artist[] = [
  {
    id: "artist_001",
    name: "Luna Sky",
    genres: ["Pop", "Electronic", "R&B"],
    location: "Los Angeles, CA",
    followers: 45234,
    verified: true,
    instruments: ["Vocals", "Synthesizer"],
    rating: 4.8,
    collaborations: 127,
    bio: "Versatile vocalist and producer with 10+ years of experience. Specializing in electronic pop and R&B collaborations.",
    availability: "available",
    responseTime: "Usually responds within 1 hour",
    hourlyRate: 75,
    isOnline: true
  },
  {
    id: "artist_002",
    name: "Marcus Chen",
    genres: ["Jazz", "Funk", "Soul"],
    location: "New York, NY",
    followers: 28910,
    verified: true,
    instruments: ["Piano", "Keys", "Production"],
    rating: 4.9,
    collaborations: 89,
    bio: "Jazz pianist and producer specializing in soulful arrangements and vintage sound design.",
    availability: "available",
    responseTime: "Usually responds within 2 hours",
    hourlyRate: 60,
    isOnline: true
  },
  {
    id: "artist_003",
    name: "The Beat Architect",
    genres: ["Hip Hop", "Trap", "Lo-fi"],
    location: "Atlanta, GA",
    followers: 67890,
    verified: true,
    instruments: ["Production", "Drums", "Mixing"],
    rating: 4.7,
    collaborations: 203,
    bio: "Award-winning producer with placements on major label releases. Specializing in hip hop and trap beats.",
    availability: "busy",
    responseTime: "Usually responds within 4 hours",
    hourlyRate: 100,
    isOnline: true
  },
  {
    id: "artist_004",
    name: "Sarah Mitchell",
    genres: ["Folk", "Indie", "Acoustic"],
    location: "Austin, TX",
    followers: 15678,
    verified: false,
    instruments: ["Guitar", "Vocals", "Songwriting"],
    rating: 4.6,
    collaborations: 45,
    bio: "Singer-songwriter with a passion for authentic storytelling and intimate acoustic performances.",
    availability: "available",
    responseTime: "Usually responds within 30 minutes",
    hourlyRate: 40,
    isOnline: true
  },
  {
    id: "artist_005",
    name: "DJ Nova",
    genres: ["Electronic", "House", "Techno"],
    location: "Miami, FL",
    followers: 89234,
    verified: true,
    instruments: ["DJ", "Production", "Synthesizer"],
    rating: 4.5,
    collaborations: 156,
    bio: "International DJ and electronic music producer. Specializing in house and techno with a modern twist.",
    availability: "offline",
    responseTime: "Usually responds within 24 hours",
    hourlyRate: 80,
    isOnline: false
  }
];

const ArtistSearch: React.FC<ArtistSearchProps> = ({ openPlayAPI, onArtistSelect, onStartSession }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedInstrument, setSelectedInstrument] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const genres = ["all", "Pop", "Electronic", "R&B", "Jazz", "Funk", "Soul", "Hip Hop", "Folk", "Indie", "House", "Techno"];
  const instruments = ["all", "Vocals", "Guitar", "Piano", "Keys", "Drums", "Production", "DJ", "Synthesizer", "Mixing"];

  useEffect(() => {
    const searchArtists = async () => {
      setLoading(true);

      try {
        if (openPlayAPI && searchQuery.trim()) {
          // Use real OpenPlay API
          const result = await openPlayAPI.getArtists({
            search: searchQuery.trim(),
            limit: 20
          });

          // Transform OpenPlay artists to our interface
          const transformedArtists: Artist[] = result.artists.map((openplayArtist: OpenPlayArtist) => ({
            id: openplayArtist.id,
            name: openplayArtist.name,
            genres: openplayArtist.metadata?.genres || [],
            location: openplayArtist.metadata?.location || 'Unknown',
            followers: openplayArtist.metadata?.followers || 0,
            verified: openplayArtist.metadata?.verified || false,
            instruments: openplayArtist.metadata?.instruments || [],
            rating: openplayArtist.metadata?.rating || 0,
            collaborations: openplayArtist.metadata?.collaborations || 0,
            bio: openplayArtist.metadata?.bio,
            image: openplayArtist.metadata?.image,
            availability: Math.random() > 0.3 ? 'available' : Math.random() > 0.5 ? 'busy' : 'offline',
            responseTime: Math.random() > 0.5 ? 'Usually responds within 1 hour' : 'Usually responds within 2 hours',
            hourlyRate: Math.floor(Math.random() * 60) + 40, // $40-100
            isOnline: Math.random() > 0.3
          }));

          setArtists(transformedArtists);
        } else {
          // Use mock data for demo or when no search query
          let filteredArtists = mockArtists;

          if (searchQuery) {
            filteredArtists = filteredArtists.filter(artist =>
              artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              artist.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
              artist.bio?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          if (selectedGenre !== "all") {
            filteredArtists = filteredArtists.filter(artist =>
              artist.genres.includes(selectedGenre)
            );
          }

          if (selectedInstrument !== "all") {
            filteredArtists = filteredArtists.filter(artist =>
              artist.instruments.includes(selectedInstrument)
            );
          }

          filteredArtists.sort((a, b) => {
            switch (sortBy) {
              case "rating":
                return b.rating - a.rating;
              case "collaborations":
                return b.collaborations - a.collaborations;
              case "followers":
                return b.followers - a.followers;
              default:
                return 0;
            }
          });

          setArtists(filteredArtists);
        }
      } catch (error) {
        console.error('Error searching artists:', error);

        // Check if it's a CORS error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('🌐 CORS detected - OpenPlay API not accessible from browser. Using demo mode.');
        }

        // Check if it's an authentication error
        if (error.message.includes('authentication') || error.message.includes('401')) {
          console.warn('🔑 OpenPlay API authentication failed - credentials may not be valid for this environment. Using demo mode.');
        }

        // Fallback to mock data
        setArtists(mockArtists);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchArtists, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedGenre, selectedInstrument, sortBy, openPlayAPI]);

  const getInstrumentIcon = (instrument: string) => {
    switch (instrument.toLowerCase()) {
      case 'vocals':
      case 'singing':
        return <Mic className="w-4 h-4" />;
      case 'guitar':
        return <Guitar className="w-4 h-4" />;
      case 'piano':
      case 'keys':
        return <Piano className="w-4 h-4" />;
      case 'drums':
      case 'percussion':
        return <Drum className="w-4 h-4" />;
      case 'production':
      case 'mixing':
      case 'dj':
        return <Headphones className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "busy":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "offline":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
        <div className="space-y-4">
          {openPlayAPI && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Search className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-500">
                OpenPlay API configured - Using demo data (API credentials need validation)
              </span>
            </div>
          )}
          {!openPlayAPI && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Search className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-500">
                Using demo mode - Browse sample artists below
              </span>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search demo artists by name, genre, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Genre:</span>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-1 rounded-md border border-primary/20 bg-background text-sm"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === "all" ? "All Genres" : genre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Instrument:</span>
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="px-3 py-1 rounded-md border border-primary/20 bg-background text-sm"
              >
                {instruments.map(instrument => (
                  <option key={instrument} value={instrument}>
                    {instrument === "all" ? "All Instruments" : instrument}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 rounded-md border border-primary/20 bg-background text-sm"
              >
                <option value="rating">Highest Rated</option>
                <option value="collaborations">Most Collaborations</option>
                <option value="followers">Most Followers</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10">
              <div className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {artists.map((artist) => (
            <Card key={artist.id} className="p-6 bg-gradient-card backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{artist.name}</h3>
                        {artist.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        <Badge className={getAvailabilityColor(artist.availability)}>
                          {artist.availability}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {artist.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {artist.followers.toLocaleString()} followers
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {artist.rating} ({artist.collaborations} collabs)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {artist.hourlyRate && (
                      <p className="text-lg font-semibold">${artist.hourlyRate}/hr</p>
                    )}
                    <p className="text-xs text-muted-foreground">{artist.responseTime}</p>
                  </div>
                </div>

                {/* Bio */}
                {artist.bio && (
                  <p className="text-sm text-muted-foreground">{artist.bio}</p>
                )}

                {/* Genres and Instruments */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {artist.genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {artist.instruments.map((instrument) => (
                      <Badge key={instrument} variant="outline" className="text-xs">
                        <span className="flex items-center gap-1">
                          {getInstrumentIcon(instrument)}
                          {instrument}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onArtistSelect(artist)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Listen
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onStartSession(artist)}
                    disabled={artist.availability === "offline"}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Start Session
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {artists.length === 0 && (
            <Card className="p-12 text-center bg-gradient-card backdrop-blur-sm border-primary/10">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No artists found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters to find more artists.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtistSearch;