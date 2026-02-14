import React, { useState, useEffect } from 'react';
import { AuctionService, API_BASE_URL } from '../../services/api';
import { Media } from '../../types';

interface Step3Props {
  propertyId?: string;
}

export const Step3Media: React.FC<Step3Props> = ({ propertyId }) => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (propertyId) {
      loadMedia();
    }
  }, [propertyId]);

  const loadMedia = async () => {
    try {
      const property = await AuctionService.getProperty(propertyId!);
      if (property.media) {
        setMediaList(property.media);
      }
    } catch (e) {
      console.error("Failed to load media", e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !propertyId) return;

    const file = e.target.files[0];

    // Create temporary preview
    const previewUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}`;
    const tempMedia: Media = {
      id: tempId as any, // Temporary ID
      property_id: propertyId,
      media_type: 'image',
      url: previewUrl,
      is_primary: mediaList.length === 0,
      created_at: new Date().toISOString()
    };

    // Optimistically update UI
    setMediaList(prev => [...prev, tempMedia]);
    setUploading(true);

    try {
      const uploaded = await AuctionService.uploadMedia(propertyId, file);
      // Replace temp media with real media from server (assuming single file response matches)
      // The API returns List[Media], so we take the first one
      if (uploaded && uploaded.length > 0) {
        setMediaList(prev => prev.map(m => m.id === (tempId as any) ? uploaded[0] : m));
      } else {
        // Fallback if empty response?
        await loadMedia();
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image");
      // Revert optimistic update
      setMediaList(prev => prev.filter(m => m.id !== (tempId as any)));
    } finally {
      setUploading(false);
      // Clean up blob URL to avoid memory leaks
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleDelete = async (mediaId: string) => {
    // Implement delete API if needed, for now just UI
    // await AuctionService.deleteMedia(mediaId);
    // loadMedia();
    alert("Delete not implemented in frontend yet");
  };

  if (!propertyId) {
    return (
      <div className="p-10 text-center">
        <p className="text-slate-500 mb-4">Please save the property details first (as Draft) to upload media.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Property Gallery</h2>
        <span className="text-sm font-medium text-slate-500">Max 50MB per file</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 transition-colors hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-800/50">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            <div className="mb-4 rounded-full bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
              <span className="material-symbols-outlined text-3xl text-primary">cloud_upload</span>
            </div>
            <p className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">SVG, PNG, JPG (max. 50MB)</p>
          </label>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {mediaList.filter(m => m.media_type === 'image').map((media, i) => {
              const imageUrl = media.url.startsWith('http') || media.url.startsWith('blob:') ? media.url : `${API_BASE_URL}${media.url}`;
              return (
                <div key={media.id || i} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                  <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${imageUrl}')` }}></div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                    <button onClick={() => handleDelete(media.id)} className="rounded-full bg-white/20 p-2 text-white hover:bg-white hover:text-red-600">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                  {media.is_primary && <div className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-white uppercase">Main</div>}
                </div>
              );
            })}
            {mediaList.filter(m => m.media_type === 'image').length === 0 && (
              <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">image</span>
                <span className="text-xs">No images yet</span>
                <span className="text-[10px] text-slate-300">(Default placeholder will be used)</span>
              </div>
            )}
          </div>
        </div>

        {/* Documents Side Panel */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">attach_file</span> Documents & Attachments
          </h3>

          <div className="space-y-3">
            <label className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 transition-colors">
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.csv" onChange={handleFileChange} />
              <span className="text-sm font-medium text-primary">Upload Document</span>
              <p className="text-xs text-slate-500 mt-1">PDF, CSV, DOC</p>
            </label>

            {mediaList.filter(m => m.media_type !== 'image').length > 0 ? (
              mediaList.filter(m => m.media_type !== 'image').map(doc => (
                <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {doc.url.split('/').pop()}
                    </p>
                    <p className="text-xs text-slate-500">Document</p>
                  </div>
                  <button onClick={() => handleDelete(doc.id)} className="text-slate-400 hover:text-red-500">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No documents attached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};