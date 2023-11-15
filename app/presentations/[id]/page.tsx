import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getPresentationById } from '../services/firebaseService'; // Adjust this import



const PresentationDetail = () => {
  const [presentation, setPresentation] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const fetchPresentation = async () => {
        const data = await getPresentationById(id);
        setPresentation(data);
      };

      fetchPresentation();
    }
  }, [id]);

  if (!presentation) return <div>Loading...</div>;

  return (
    <div>
      <h1>{presentation.title}</h1>
      <iframe src={presentation.embedUrl} width="600" height="400"></iframe>
    </div>
  );
};

export default PresentationDetail;
