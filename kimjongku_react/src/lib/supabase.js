import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lnfoyqgnldmeonuyezsh.supabase.co"; // 프로젝트 URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZm95cWdubGRtZW9udXllenNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTgzMTAsImV4cCI6MjA4MDEzNDMxMH0.FWLEvrQO6IDunRMLhiZrBNF1tMA6Bkt66ncWSqJrCFQ"; // anon key

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
});

// 개발 편의: 브라우저 콘솔에서 테스트할 수 있도록 전역에 노출
if (typeof window !== 'undefined') {
  // 안전하게 덮어쓰기 방지
  if (!window.supabase) {
    window.supabase = supabase;
  }
}

// 이미지 URL 최적화 함수
export const optimizeImageUrl = (url, width = 1000, quality = 80) => {
	if (!url) return url;
	if (typeof url !== 'string') return url;

	// 터치 기기(iPad desktop UA 포함)는 원본 URL을 사용해 호환성 문제를 피한다.
	if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
		const ua = navigator.userAgent || '';
		const touchDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
		const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
		if (touchDevice || mobileUA) return url;
	}

	// Supabase 이미지 URL에만 최적화 파라미터 추가 (중복 파라미터 방지)
	if (url.includes('supabase')) {
		if (/([?&])width=|([?&])quality=/.test(url)) {
			return url;
		}
		const separator = url.includes('?') ? '&' : '?';
		return `${url}${separator}width=${width}&quality=${quality}`;
	}
	return url;
};
