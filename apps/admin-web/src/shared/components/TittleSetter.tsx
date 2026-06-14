import { useEffect } from "react";

export default function TitleSetter() {
  useEffect(() => {
    document.title = "Recíclame";
  }, []);

  return null;
}
