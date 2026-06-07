import { NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let prisma: any;
  let service: ReviewsService;

  beforeEach(() => {
    prisma = {
      review: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      reviewHelpfulVote: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn((operations) => Promise.all(operations)),
    };
    service = new ReviewsService(prisma, { create: jest.fn() } as any);
  });

  it('adds a helpful vote once per user', async () => {
    prisma.review.findUnique
      .mockResolvedValueOnce({ id: 'r1', helpfulCount: 0 })
      .mockResolvedValueOnce({ id: 'r1', helpfulCount: 1 });
    prisma.reviewHelpfulVote.findUnique.mockResolvedValue(null);

    await expect(service.toggleHelpful('u1', 'r1')).resolves.toEqual({ status: 'added', helpfulCount: 1 });
    expect(prisma.reviewHelpfulVote.create).toHaveBeenCalledWith({ data: { reviewId: 'r1', userId: 'u1' } });
    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { helpfulCount: { increment: 1 } },
    });
  });

  it('removes an existing helpful vote', async () => {
    prisma.review.findUnique
      .mockResolvedValueOnce({ id: 'r1', helpfulCount: 2 })
      .mockResolvedValueOnce({ id: 'r1', helpfulCount: 1 });
    prisma.reviewHelpfulVote.findUnique.mockResolvedValue({ id: 'vote1' });

    await expect(service.toggleHelpful('u1', 'r1')).resolves.toEqual({ status: 'removed', helpfulCount: 1 });
    expect(prisma.reviewHelpfulVote.delete).toHaveBeenCalledWith({ where: { id: 'vote1' } });
    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { helpfulCount: { decrement: 1 } },
    });
  });

  it('rejects helpful votes for missing reviews', async () => {
    prisma.review.findUnique.mockResolvedValue(null);
    await expect(service.toggleHelpful('u1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
