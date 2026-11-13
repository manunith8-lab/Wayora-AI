import React from 'react';
import { X, MapPin } from 'lucide-react';
import { DestinationPhoto } from '../../types/travel';

interface PhotoGalleryModalProps {
  photo: DestinationPhoto | null;
  onClose: () => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  photo,
  onClose,
}) => {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-10"
      >
        <X size={22} />
      </button>

      <div className="max-w-4xl max-h-[90vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[75vh]">
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-full object-contain max-h-[75vh]"
          />
        </div>

        <div className="text-white space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gold-500 text-forest-950 inline-block mb-1">
            {photo.category}
          </span>
          <p className="text-sm sm:text-base font-medium max-w-2xl">
            {photo.caption}
          </p>
        </div>
      </div>
    </div>
  );
};
