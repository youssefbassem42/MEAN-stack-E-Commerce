import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'ecommerce-theme';

  public readonly mode = signal<ThemeMode>(this.loadStoredMode());

  constructor() {
    effect(() => {
      const mode = this.mode();
      this.document.documentElement.dataset['theme'] = mode;
      this.document.documentElement.classList.toggle('dark', mode === 'dark');
      localStorage.setItem(this.storageKey, mode);
    });
  }

  public toggleTheme() {
    this.mode.update((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  }

  private loadStoredMode(): ThemeMode {
    if (typeof localStorage === 'undefined') {
      return 'light';
    }

    const storedMode = localStorage.getItem(this.storageKey);
    return storedMode === 'dark' ? 'dark' : 'light';
  }
}
