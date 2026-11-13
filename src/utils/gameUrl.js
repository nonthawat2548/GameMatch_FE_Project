export function gameID(value) {
  const match=String(value||'').match(/^([1-9]\d*)(?:-[a-z0-9]+(?:-[a-z0-9]+)*)?$/);
  return match?.[1] || null;
}
export function gameUrl(game) {
  const slug=String(game.title||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,100).replace(/-+$/,'');
  return '/games/'+game.id+(slug?'-'+slug:'');
}
