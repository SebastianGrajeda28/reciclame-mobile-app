import { type FC, useCallback, useEffect, useState } from "react";
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  defaultImageUrl?: string | null;
}

export const ImageUploader: FC<ImageUploaderProps> = ({ 
  value, 
  onChange, 
  disabled = false, 
  defaultImageUrl 
}) => {
  const [, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (onChange) {
        uploadImage(file).then(onChange);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, uploadImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif','webp','.bmp'],
    },
    disabled,
    multiple: false
  });

  // Mostrar valor inicial o imagen por defecto
  useEffect(() => {
    if (value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(value);
    } else if (defaultImageUrl) {
      setPreviewUrl(defaultImageUrl);
    }
  }, [value, defaultImageUrl]);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <input {...getInputProps()} />
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Vista previa"
          className="mx-auto h-40 object-contain"
        />
      ) : (
        <p>Arrastra una imagen aquí o haz clic para seleccionar una</p>
      )}
    </div>
  );
};

async function uploadImage(file: File): Promise<string> {
  // Placeholder implementation: replace with real upload logic.
  return Promise.resolve(URL.createObjectURL(file));
}

