
import React from 'react';
import type { Playlist } from '../types';
import { MusicIcon } from './icons/MusicIcon';

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  return (
    <div className="bg-[#282828] p-4 rounded-lg w-full animate-fade-in">
      <h3 className="text-xl font-bold text-white mb-3">{playlist.playlistName}</h3>
      <ul className="space-y-3">
        {playlist.songs.map((song, index) => (
          <li key={index} className="flex items-center">
            <div className="text-[#1DB954] mr-3">
              <MusicIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">{song.title}</p>
              <p className="text-sm text-gray-400">{song.artist} - {song.album}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
