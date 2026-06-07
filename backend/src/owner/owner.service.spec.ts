import { BookingStatus, HotelApprovalStatus, Role, TourApprovalStatus } from '@prisma/client';
import { OwnerService } from './owner.service';

describe('OwnerService analytics and review replies', () => {
  let prisma: any;
  let notifications: any;
  let service: OwnerService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'owner1', role: Role.OWNER, isVerified: true, name: 'Owner' }),
        findMany: jest.fn().mockResolvedValue([{ id: 'admin1' }, { id: 'admin2' }]),
      },
      ownerApplication: { upsert: jest.fn() },
      booking: { findMany: jest.fn() },
      room: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      hotel: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      tour: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      review: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      listingView: { findMany: jest.fn() },
    };
    notifications = {
      create: jest.fn().mockResolvedValue({ id: 'n1' }),
      createMany: jest.fn().mockResolvedValue([]),
    };
    service = new OwnerService(prisma, notifications);
  });

  const flushNotifications = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };

  it('notifies admins and the user when a verified user requests owner access', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'user1', role: Role.USER, isVerified: true, name: 'Guest' });
    prisma.ownerApplication.upsert.mockResolvedValue({
      id: 'app1',
      userId: 'user1',
      businessName: 'Local Stay',
      status: 'PENDING',
    });

    const result = await service.createApplication('user1', {
      businessName: 'Local Stay',
      contactName: 'Guest',
      phone: '0900000000',
      address: 'Old Quarter',
      city: 'Ha Noi',
    });
    await flushNotifications();

    expect(result.id).toBe('app1');
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: Role.ADMIN },
      select: { id: true },
    });
    expect(notifications.createMany).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        userId: 'admin1',
        type: 'OWNER_APPLICATION_REQUESTED',
        link: '/admin',
      }),
    ]));
    expect(notifications.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user1',
      type: 'OWNER_APPLICATION_SUBMITTED',
      link: '/owner',
    }));
  });

  it('notifies admins and the owner when an owner submits a new homestay for review', async () => {
    prisma.hotel.create.mockResolvedValue({
      id: 'h1',
      name: 'Lake House',
      ownerId: 'owner1',
      approvalStatus: HotelApprovalStatus.PENDING_REVIEW,
      rooms: [],
      _count: { bookings: 0, reviews: 0 },
    });

    const result = await service.createHotel('owner1', {
      name: 'Lake House',
      address: '1 Lake Road',
      city: 'Da Lat',
    });
    await flushNotifications();

    expect(result.id).toBe('h1');
    expect(notifications.createMany).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        userId: 'admin1',
        type: 'LISTING_REVIEW_REQUESTED',
        title: 'Co homestay moi can duyet',
        link: '/admin',
      }),
    ]));
    expect(notifications.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'owner1',
      type: 'LISTING_REVIEW_SUBMITTED',
      link: '/owner',
    }));
  });

  it('filters owner analytics by owned, non-archived hotels and tours', async () => {
    const today = new Date();
    prisma.booking.findMany.mockResolvedValue([
      { id: 'b1', createdAt: today, status: BookingStatus.COMPLETED, totalAmount: 1200000, hotel: { id: 'h1', name: 'Villa' }, tour: null },
    ]);
    prisma.room.findMany.mockResolvedValue([
      {
        id: 'room1',
        name: 'Suite',
        totalRooms: 2,
        hotel: { id: 'h1', name: 'Villa' },
        availability: [{ date: today, booked: 1, available: 1 }],
      },
    ]);
    prisma.hotel.findMany.mockResolvedValue([
      {
        id: 'h1',
        name: 'Villa',
        _count: { bookings: 3, reviews: 2, listingViews: 9 },
        bookings: [{ totalAmount: 1200000 }],
      },
    ]);
    prisma.tour.findMany.mockResolvedValue([]);
    prisma.review.findMany.mockResolvedValue([{ rating: 5, comment: 'Great', hotelId: 'h1', tourId: null, createdAt: today }]);
    prisma.listingView.findMany.mockResolvedValue([{ id: 'v1', hotelId: 'h1', tourId: null, createdAt: today }]);

    const result = await service.getAnalytics('owner1', '7d');

    const hotelWhere = { ownerId: 'owner1', approvalStatus: { not: HotelApprovalStatus.ARCHIVED } };
    const tourWhere = { ownerId: 'owner1', approvalStatus: { not: TourApprovalStatus.ARCHIVED } };
    expect(prisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ OR: [{ hotel: hotelWhere }, { tour: tourWhere }] }),
    }));
    expect(result.range).toBe('7d');
    expect(result.revenueSeries).toHaveLength(7);
    expect(result.reviewSummary.averageRating).toBe(5);
    expect(result.funnel).toEqual({ views: 1, bookings: 1, completed: 1, conversionRate: 100 });
    expect(result.topPerforming[0]).toMatchObject({ id: 'h1', type: 'hotel', revenue: 1200000 });
  });

  it('lets an owner reply only to reviews on their listing and notifies the reviewer', async () => {
    const review = {
      id: 'r1',
      userId: 'guest1',
      hotelId: 'h1',
      tourId: null,
      hotel: { ownerId: 'owner1', name: 'Villa' },
      tour: null,
    };
    prisma.review.findUnique.mockResolvedValue(review);
    prisma.review.update.mockResolvedValue({ ...review, replyContent: 'Thanks!', repliedAt: new Date(), user: { name: 'Guest', avatar: null } });

    const result = await service.replyReview('owner1', 'r1', '  Thanks!  ');

    expect(result.replyContent).toBe('Thanks!');
    expect(prisma.review.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'r1' },
      data: expect.objectContaining({ replyContent: 'Thanks!', repliedAt: expect.any(Date) }),
    }));
    expect(notifications.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'guest1',
      type: 'REVIEW_REPLY',
      link: '/homestays/h1',
    }));
  });

  it('lists reviews only for listings owned by the current owner', async () => {
    prisma.review.findMany.mockResolvedValue([]);

    await service.getReviews('owner1');

    expect(prisma.review.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        OR: [
          { hotel: { ownerId: 'owner1', approvalStatus: { not: HotelApprovalStatus.ARCHIVED } } },
          { tour: { ownerId: 'owner1', approvalStatus: { not: TourApprovalStatus.ARCHIVED } } },
        ],
      },
      include: expect.objectContaining({
        user: { select: { id: true, name: true, avatar: true } },
      }),
      orderBy: { createdAt: 'desc' },
      take: 100,
    }));
  });
});
