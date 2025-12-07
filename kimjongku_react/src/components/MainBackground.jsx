import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const DEFAULT_BG = '/src/assets/year-bg.png';

function MainBackground() {
  const [bgImage, setBgImage] = useState(DEFAULT_BG);

  useEffect(() => {
    // DB에서 url 불러오기
    const load = async () => {
      const { data, error } = await supabase
        .from('main_bg')
        .select('url')
        .eq('id', 1)
        .single();
      if (data?.url) setBgImage(data.url);
    };
    load();
  }, []);

  return (
    <div style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
    }} />
  );
}

export default MainBackground;
