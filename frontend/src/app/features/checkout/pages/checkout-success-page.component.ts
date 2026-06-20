import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-success-page.component.html',
  styleUrl: './checkout-success-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutSuccessPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly orderId = signal<string>(
    this.route.snapshot.queryParamMap.get('orderId') || ''
  );
}
