import { useEffect, useState } from "react";

export default function useIdleTimer(timeout = 6000) {
    const [isIdle, setIsIdle] = useState(false);
    let timer;

    const resetTimer = () => {
        clearTimeout(timer);
        setIsIdle(false);
        timer = setTimeout(() => setIsIdle(true), timeout);
    };

    useEffect(() => {
        const events = ["mousemove", "click", "keydown", "wheel", "touchstart"];
        events.forEach((event) => window.addEventListener(event, resetTimer));

        resetTimer(); // 처음 실행
        return () => events.forEach((event) => window.removeEventListener(event, resetTimer));
    }, []);

    return isIdle;
}
