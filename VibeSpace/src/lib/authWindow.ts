function openOAuthWindow(url: string) {
  const width = 600;
  const height = 700;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    url,
    "OAuthLogin",
    `width=${width},height=${height},top=${top},left=${left}`
  );
}

export default openOAuthWindow;