/** fetch no navegador que devolve o JSON ou lança a mensagem de erro da API. */
export async function postJSON<T>(url: string, body: unknown | FormData): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    ...(body instanceof FormData
      ? { body }
      : { body: JSON.stringify(body), headers: { "content-type": "application/json" } }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
  return data as T;
}
