export function getClaimMessage(name: string, code: string, price: number) {
  return `CLAIM: ${name} (${code}) - $${price}`;
}

export function getTelegramClaimLink(name: string, code: string, price: number) {
  const text = encodeURIComponent(getClaimMessage(name, code, price));
  const username = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME?.replace("@", "");

  if (username) {
    return `https://t.me/${username}?text=${text}`;
  }

  return `https://t.me/share/url?url=&text=${text}`;
}
