import { useState, useEffect } from "react";


export function useIsVisible(ref) {
    // assume visible until the observer reports, so the sticky bar does not flash its compact mode
    const [isIntersecting, setIntersecting] = useState(true);
  
    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting)
      );
  
      observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }, [ref]);
  
    return isIntersecting;
  }
  