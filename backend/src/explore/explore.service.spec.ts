import { HotelApprovalStatus, TourApprovalStatus } from '@prisma/client';
import { ExploreService } from './explore.service';

describe('ExploreService', () => {
  it('returns filtered map items and markers for hotels and tours with coordinates', async () => {
    const prisma = {
      hotel: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'h1',
            name: 'Hoi An Home',
            description: 'Nice',
            city: 'Hoi An',
            address: 'Old town',
            lat: 15.88,
            lng: 108.33,
            rating: 4.2,
            images: ['h.jpg'],
            rooms: [{ basePrice: 400000 }],
            reviews: [{ rating: 5 }, { rating: 4 }],
          },
          {
            id: 'h2',
            name: 'Too Expensive',
            description: '',
            city: 'Da Nang',
            address: '',
            lat: 16.05,
            lng: 108.2,
            rating: 5,
            images: [],
            rooms: [{ basePrice: 9000000 }],
            reviews: [],
          },
        ]),
      },
      tour: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 't1',
            name: 'Da Nang Food',
            description: 'Food tour',
            location: 'Da Nang',
            basePrice: 600000,
            images: ['t.jpg'],
            reviews: [{ rating: 5 }],
          },
        ]),
      },
    };
    const service = new ExploreService(prisma as any);

    const result = await service.findAll({ type: 'all', maxPrice: '1000000', rating: '4' });

    expect(prisma.hotel.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ approvalStatus: HotelApprovalStatus.APPROVED }),
    }));
    expect(prisma.tour.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ approvalStatus: TourApprovalStatus.APPROVED, basePrice: { lte: 1000000 } }),
    }));
    expect(result.items.map((item) => item.id)).toEqual(['t1', 'h1']);
    expect(result.markers).toHaveLength(2);
    expect(result.markers[0]).toMatchObject({ id: 't1', lat: 16.0544, lng: 108.2022 });
  });
});
