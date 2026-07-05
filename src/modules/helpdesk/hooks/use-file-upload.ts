import { useState } from 'react';
import { useGetPreSignedUrlForUpload } from '@/lib/api/hooks/use-storage';
import { ModuleName } from '@/constant/modules.constants';

const projectKey = import.meta.env.VITE_X_BLOCKS_KEY || '';

export const useFileUpload = () => {
  const { mutateAsync: getPreSignedUrl } = useGetPreSignedUrlForUpload();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    try {
      const res = await getPreSignedUrl({
        name: file.name,
        projectKey,
        itemId: '',
        metaData: '',
        accessModifier: 'Public',
        configurationName: 'Default',
        parentDirectoryId: '',
        tags: '',
        moduleName: ModuleName.DefaultConstruct,
      });

      if (!res.isSuccess || !res.uploadUrl) {
        setError('Failed to get upload URL');
        return null;
      }

      await fetch(res.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type, 'x-ms-blob-type': 'BlockBlob' },
      });

      return res.uploadUrl.split('?')[0];
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, error };
};
