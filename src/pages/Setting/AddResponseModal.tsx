// src/pages/Setting/AddResponseModal.tsx
import React, { useRef, useState } from 'react';
import uploadIcon from '@/assets/setting/upload.svg';

interface AddResponseFormProps {
  onClose: () => void;
  onSubmit: (data: { message: string; images: File[] }) => void;
  ticketId?: string;
}

const AddResponseForm: React.FC<AddResponseFormProps> = ({ onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSubmit({ message, images });
    setMessage('');
    setImages([]);
    onClose();
  };

  return (
    <div className="w-full max-w-2xl ml-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[#00000099] font-bold text-2xl cursor-pointer" onClick={onClose}>
          All Ticket{" "}
        </span>
        <span className="text-black font-bold text-2xl">&gt; Add Response</span>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block font-semibold mb-2">Add Response</label>
          <textarea
            className="w-full border rounded-md px-4 py-3 min-h-[120px] text-black placeholder-black focus:outline-none"
            placeholder="Explain here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-8">
          <label className="block font-semibold mb-2">Images Uploaded</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-1 rounded bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white font-semibold text-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Img
              <img src={uploadIcon} alt="upload" className="w-5 h-5" />
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            {images.length > 0 && (
              <div className="ml-4 flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <span key={idx} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-black">
                    {img.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="px-12 py-2 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-[#D32F2F] to-[#6A1B9A] shadow hover:opacity-90"
          >
            Submit Response
          </button>
        </div>
        
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="text-[#6A1B9A] font-semibold hover:underline"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddResponseForm;