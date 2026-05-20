import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { REVIEWS } from './review.mock';
import type { IReview, IReviewModerationEvent, ReviewStatus } from './review.types';

@Injectable({ providedIn: 'root' })
export class ReviewStore {
  private readonly _reviews = signal<IReview[]>(REVIEWS);
  private readonly _saving = signal(false);

  readonly reviews = this._reviews.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed(() => {
    const map = new Map<ReviewStatus, number>();
    this._reviews().forEach((r) => map.set(r.status, (map.get(r.status) ?? 0) + 1));
    return map;
  });

  readonly averageRating = computed(() => {
    const approved = this._reviews().filter((r) => r.status === 'approved');
    if (approved.length === 0) return 0;
    return approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
  });

  findById(id: string): IReview | undefined {
    return this._reviews().find((r) => r.id === id);
  }

  findByProduct(productId: string): IReview[] {
    return this._reviews().filter((r) => r.productId === productId);
  }

  findByCustomer(customerId: string): IReview[] {
    return this._reviews().filter((r) => r.customerId === customerId);
  }

  async transition(
    id: string,
    action: 'approve' | 'reject' | 'hide' | 'unhide',
    actor: string,
    reason = '',
  ): Promise<IReview | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      const review = this.findById(id);
      if (!review) return null;

      const nextStatus: ReviewStatus =
        action === 'approve'
          ? 'approved'
          : action === 'reject'
            ? 'rejected'
            : action === 'hide'
              ? 'hidden'
              : 'approved';

      const eventAction: IReviewModerationEvent['action'] =
        action === 'unhide'
          ? 'unhidden'
          : action === 'approve'
            ? 'approved'
            : action === 'reject'
              ? 'rejected'
              : 'hidden';

      const event: IReviewModerationEvent = {
        id: `${review.id}-evt-${review.events.length + 1}`,
        occurredAt: new Date().toISOString(),
        action: eventAction,
        actor,
        reason,
      };

      const updated: IReview = {
        ...review,
        status: nextStatus,
        moderatedAt: event.occurredAt,
        moderatedBy: actor,
        rejectReason: action === 'reject' ? reason : review.rejectReason,
        events: [...review.events, event],
      };
      this._reviews.update((list) => list.map((r) => (r.id === id ? updated : r)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }
}
