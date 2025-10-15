
import type { EMOTIONS, LANGUAGES } from './constants';

export type Emotion = typeof EMOTIONS[number];
export type Language = typeof LANGUAGES[number];

export interface Song {
  title: string;
  artist: string;
  album: string;
}

export interface Playlist {
  playlistName: string;
  songs: Song[];
}
