(() => {
  const upstreamOrigin = "https://ownex-commerce-admin.manhddmkt.chatgpt.site";
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    const inputUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input?.url || "";

    if (inputUrl.startsWith(upstreamOrigin)) {
      const sameOriginPath = inputUrl.slice(upstreamOrigin.length) || "/";
      return nativeFetch(sameOriginPath, init);
    }

    return nativeFetch(input, init);
  };
})();
