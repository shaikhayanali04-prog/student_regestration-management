import { useEffect, useState } from "react";

export function useImagePreview(initialUrl = "") {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl || "");

  useEffect(() => {
    setPreviewUrl(initialUrl || "");
  }, [initialUrl]);

  useEffect(() => {
    if (!file) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return {
    file,
    previewUrl,
    setFile,
    onFileChange(event) {
      const nextFile = event.target.files?.[0] || null;
      setFile(nextFile);
    },
    reset() {
      setFile(null);
      setPreviewUrl(initialUrl || "");
    },
  };
}
