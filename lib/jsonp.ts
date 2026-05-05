/** JSONP fetch — for APIs that don't support CORS but support ?callback= */
export function fetchJsonp<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const cb = `_jsonp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const script = document.createElement("script");
    (window as any)[cb] = (data: T) => {
      delete (window as any)[cb];
      script.remove();
      resolve(data);
    };
    script.src = `${url}${url.includes("?") ? "&" : "?"}callback=${cb}`;
    script.onerror = () => {
      delete (window as any)[cb];
      script.remove();
      reject(new Error("JSONP load failed"));
    };
    document.body.appendChild(script);
  });
}
