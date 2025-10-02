/**
 * Type definitions for CoWriter components
 */

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  location?: string;
  followers?: number;
  verified?: boolean;
  instruments: string[];
  rating?: number;
  collaborations?: number;
  image?: string;
  bio?: string;
  availability: 'available' | 'busy' | 'offline';
  responseTime: string;
  hourlyRate?: number;
  isOnline: boolean;
}

export interface Session {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'completed';
  collaborators: Artist[];
  createdAt: string;
  lastActivity: string;
  type: 'songwriting' | 'production' | 'recording' | 'mixing';
  description?: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Track {
  id: string;
  name: string;
  duration: string;
  artist: string;
  muted: boolean;
  solo: boolean;
  volume: number;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  author: string;
  timestamp: string;
}

export interface FileAsset {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'document' | 'image';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}