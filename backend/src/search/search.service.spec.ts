import { HotelApprovalStatus, TourApprovalStatus } from '@prisma/client';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let prisma: any;
  let blogService: any;
  let service: SearchService;

  beforeEach(() => {
    prisma = {
      tour: { findMany: jest.fn() },
      hotel: { findMany: jest.fn() },
    };
    blogService = { findAll: jest.fn() };
    service = new SearchService(prisma, blogService);
  });

  it('returns recommendations for short queries', async () => {
    prisma.tour.findMany.mockResolvedValue([]);
    prisma.hotel.findMany.mockResolvedValue([]);

    await expect(service.search('a')).resolves.toEqual({ tours: [], homestays: [], blog: [], recommendations: [] });
    expect(prisma.tour.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { approvalStatus: TourApprovalStatus.APPROVED },
      take: 4,
    }));
  });

  it('searches approved tours, approved homestays, and matching blog posts', async () => {
    prisma.tour.findMany
      .mockResolvedValueOnce([{ id: 't1', name: 'Da Nang Food', location: 'Da Nang', description: '', basePrice: 500000, images: ['t.jpg'], reviews: [{ rating: 5 }] }])
      .mockResolvedValueOnce([]);
    prisma.hotel.findMany
      .mockResolvedValueOnce([{ id: 'h1', name: 'Sea Home', city: 'Da Nang', address: '', description: '', images: ['h.jpg'], rating: 4.4, rooms: [{ basePrice: 300000 }], reviews: [{ rating: 4 }] }])
      .mockResolvedValueOnce([]);
    blogService.findAll.mockResolvedValue([
      { id: 'b1', title: 'Da Nang guide', excerpt: 'Local tips', category: 'Guide', coverImage: 'b.jpg' },
      { id: 'b2', title: 'Hue guide', excerpt: '', category: 'Guide', coverImage: 'x.jpg' },
    ]);

    const result = await service.search('Da Nang');

    expect(prisma.tour.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: expect.objectContaining({ approvalStatus: TourApprovalStatus.APPROVED }),
      take: 8,
    }));
    expect(prisma.hotel.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: expect.objectContaining({ approvalStatus: HotelApprovalStatus.APPROVED }),
      take: 8,
    }));
    expect(result.tours[0]).toMatchObject({ id: 't1', href: '/tours/t1', rating: 5 });
    expect(result.homestays[0]).toMatchObject({ id: 'h1', href: '/homestays/h1', price: 300000 });
    expect(result.blog).toEqual([{ id: 'b1', title: 'Da Nang guide', subtitle: 'Guide', image: 'b.jpg', href: '/blog/b1' }]);
  });
});
