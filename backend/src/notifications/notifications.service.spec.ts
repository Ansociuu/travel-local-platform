import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let prisma: any;
  let realtime: any;
  let service: NotificationsService;

  beforeEach(() => {
    prisma = {
      notification: {
        create: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    realtime = { emitToUser: jest.fn() };
    service = new NotificationsService(prisma, realtime);
  });

  it('creates a notification and emits realtime payload plus unread count', async () => {
    const notification = {
      id: 'n1',
      userId: 'u1',
      type: 'BOOKING_CREATED',
      title: 'New booking',
      content: 'Booking received',
      link: '/dashboard',
      read: false,
      createdAt: new Date(),
    };
    prisma.notification.create.mockResolvedValue(notification);
    prisma.notification.count.mockResolvedValue(4);

    const result = await service.create({
      userId: 'u1',
      type: 'BOOKING_CREATED',
      title: 'New booking',
      content: 'Booking received',
      link: '/dashboard',
    });

    expect(result).toBe(notification);
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'u1',
        type: 'BOOKING_CREATED',
        title: 'New booking',
        content: 'Booking received',
        link: '/dashboard',
      },
    });
    expect(realtime.emitToUser).toHaveBeenCalledWith('u1', 'notification:new', notification);
    expect(realtime.emitToUser).toHaveBeenCalledWith('u1', 'notification:unread-count', { unreadCount: 4 });
  });

  it('marks only the owner notification as read and emits the next count', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 1 });
    prisma.notification.count.mockResolvedValue(2);

    await expect(service.markRead('u1', 'n1')).resolves.toEqual({ updated: 1, unreadCount: 2 });
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'u1' },
      data: { read: true },
    });
    expect(realtime.emitToUser).toHaveBeenCalledWith('u1', 'notification:unread-count', { unreadCount: 2 });
  });
});
