export function createFavoritesController({ repository, getFavorites, setFavorites, changed, failed }) {
  const pending = new Set();
  return {
    pending,
    async toggle(id) {
      if (pending.has(id)) return;
      const selected = !getFavorites().includes(id);
      pending.add(id);
      changed();
      try {
        await repository.setFavorite(id, selected);
        const current = getFavorites();
        setFavorites(selected ? [...new Set([...current, id])] : current.filter(value => value !== id));
      } catch (error) {
        failed(error);
      } finally {
        pending.delete(id);
        changed();
      }
    },
  };
}

export function syncFavoriteButtons(root, favorites, pending) {
  root.querySelectorAll('[data-favorite]').forEach(button => {
    const id = button.dataset.favorite;
    const busy = pending.has(id);
    const selected = favorites.includes(id);
    button.disabled = busy;
    button.classList.toggle('saved', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-busy', String(busy));
    button.setAttribute('aria-label', busy ? 'Сохранение…' : selected ? 'Удалить из избранного' : 'Добавить в избранное');
    button.title = busy ? 'Сохранение…' : button.getAttribute('aria-label');
  });
}
