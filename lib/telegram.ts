export function getClaimMessage(name: string, code: string, price: number) {
  return `CLAIM: ${name} (${code}) - $${price}`;
}

export function getTelegramUsernameDisplay() {
  const username = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME?.trim().replace(/^@/, "");
  return username ? `@${username}` : "@beppooo";
}

export function getTelegramProfileLink() {
  const username = getTelegramUsernameDisplay().replace(/^@/, "");
  return `https://t.me/${username}`;
}

export function getTelegramClaimLink(name: string, code: string, price: number) {
  const text = encodeURIComponent(getClaimMessage(name, code, price));
  const username = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME?.trim().replace(/^@/, "");

  if (username) {
    return `https://t.me/${username}?text=${text}`;
  }

  return `https://t.me/share/url?url=&text=${text}`;
}
