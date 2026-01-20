import { useState, useEffect } from "react";
import debounce from "lodash.debounce";

export const useIsMobile = () =>{
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200);

    check(); // initial check
    window.addEventListener("resize", check);

    return () => {
      window.removeEventListener("resize", check);
      check.cancel(); // cleanup lodash debounce
    };
  }, []);

  return isMobile;
}