import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  protected readonly cartService = inject(CartService);
}
