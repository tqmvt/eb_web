const LOCAL_STORAGE_ITEMS = {
  theme: 'THEME',
};

export const setThemeInStorage = (theme) => {
  localStorage.setItem(LOCAL_STORAGE_ITEMS.theme, theme);
};

export const getThemeInStorage = () => {
  return localStorage.getItem(LOCAL_STORAGE_ITEMS.theme);
};
