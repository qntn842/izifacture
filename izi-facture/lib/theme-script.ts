export const THEME_STORAGE_KEY = 'izi_theme';

/**
 * Script exécuté dans <head> avant l'affichage : applique le thème sauvegardé
 * pour éviter un flash blanc au chargement en mode sombre.
 */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;
