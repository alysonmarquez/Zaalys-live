// Service worker: recebe os alertas push e abre o painel ao tocar.
self.addEventListener("push", (event) => {
  let data = { title: "Zaalys", body: "Você tem um novo aviso.", url: "/painel" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon/favicon.svg",
      badge: "/favicon/favicon.svg",
      data: { url: data.url },
      tag: "live-status",
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/painel";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) if (client.url.includes(url) && "focus" in client) return client.focus();
      return self.clients.openWindow(url);
    }),
  );
});
