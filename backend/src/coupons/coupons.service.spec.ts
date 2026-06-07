import { CouponsService } from './coupons.service';

describe('CouponsService', () => {
  it('returns only active public coupons with remaining usage', async () => {
    const now = new Date();
    const coupons = [
      { id: 'open', code: 'OPEN', usageLimit: null, usedCount: 99, endDate: now },
      { id: 'limited', code: 'LIMIT', usageLimit: 10, usedCount: 5, endDate: now },
      { id: 'spent', code: 'SPENT', usageLimit: 3, usedCount: 3, endDate: now },
    ];
    const prisma = {
      coupon: {
        findMany: jest.fn().mockResolvedValue(coupons),
      },
    };
    const service = new CouponsService(prisma as any);

    await expect(service.findPublicActive()).resolves.toEqual([coupons[0], coupons[1]]);
    expect(prisma.coupon.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        startDate: { lte: expect.any(Date) },
        endDate: { gte: expect.any(Date) },
      },
      orderBy: { endDate: 'asc' },
    });
  });
});
