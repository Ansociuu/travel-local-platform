export const allDestinations = [
  { id: 1, name: "Hạ Long Bay", country: "Việt Nam", region: "bac", price: "2,490,000", nights: 3, rating: 4.9, reviews: 1284, tag: "Bestseller", img: "https://tse1.mm.bing.net/th/id/OIP.RABPkjgoEM87UPjuWWfxSQHaE7?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 2, name: "Hội An Ancient", country: "Việt Nam", region: "trung", price: "1,890,000", nights: 2, rating: 4.8, reviews: 942, tag: "Hot", img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80" },
  { id: 3, name: "Sapa Highland", country: "Việt Nam", region: "bac", price: "2,190,000", nights: 3, rating: 4.7, reviews: 756, tag: "New", img: "https://res.klook.com/image/upload/fl_lossy.progressive,q_60/Mobile/City/nab4excv9bkndhqnsyvl.jpg" },
  { id: 4, name: "Phú Quốc Island", country: "Việt Nam", region: "nam", price: "3,290,000", nights: 4, rating: 4.9, reviews: 2103, tag: "Luxury", img: "https://vietnam.travel/sites/default/files/2022-10/shutterstock_1660147075.jpg" },
  { id: 5, name: "Đà Nẵng Beach", country: "Việt Nam", region: "trung", price: "1,690,000", nights: 2, rating: 4.6, reviews: 889, tag: "Hot", img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80" },
  { id: 6, name: "Cần Thơ Mekong", country: "Việt Nam", region: "nam", price: "1,490,000", nights: 2, rating: 4.5, reviews: 631, tag: "New", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80" },
  { id: 7, name: "Ninh Bình", country: "Việt Nam", region: "bac", price: "1,290,000", nights: 2, rating: 4.7, reviews: 774, tag: "Bestseller", img: "https://tse2.mm.bing.net/th/id/OIP.Wovd7xc9rkemWkDRiGXfngHaF7?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { id: 8, name: "Bali Adventure", country: "Indonesia", region: "quocte", price: "8,990,000", nights: 5, rating: 4.9, reviews: 3241, tag: "Luxury", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80" },
];

export const homestays = [
  { id: 1, name: "Villa Biển Xanh", location: "Đà Nẵng", price: "850,000", per: "đêm", rating: 4.9, beds: 3, baths: 2, guests: 6, img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=500&q=80" },
  { id: 2, name: "Bamboo House", location: "Đà Lạt", price: "620,000", per: "đêm", rating: 4.7, beds: 2, baths: 1, guests: 4, img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=500&q=80" },
  { id: 3, name: "Treehouse Retreat", location: "Mộc Châu", price: "490,000", per: "đêm", rating: 4.8, beds: 1, baths: 1, guests: 2, img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80" },
];

export const stats = [
  { label: "Điểm đến", value: 500, suffix: "+", icon: "Map" },
  { label: "Du khách hài lòng", value: 120, suffix: "K+", icon: "Smile" },
  { label: "Đối tác homestay", value: 2400, suffix: "+", icon: "Home" },
  { label: "Năm kinh nghiệm", value: 12, suffix: "", icon: "Star" },
];

export const regionFilters = [
  { key: "all", label: "Tất cả" },
  { key: "bac", label: "Miền Bắc" },
  { key: "trung", label: "Miền Trung" },
  { key: "nam", label: "Miền Nam" },
];

export const mockTourDetail = {
  gallery: [
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80",
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    "https://images.unsplash.com/photo-1572791870574-8a7b7b3d2dd3?w=800&q=80",
    "https://images.unsplash.com/photo-1598714805247-5dd49bcd5be5?w=800&q=80",
    "https://images.unsplash.com/photo-1564596823821-79b7a0314a52?w=800&q=80"
  ],
  description: "Trải nghiệm hành trình tuyệt vời kết hợp giữa thiên nhiên hùng vĩ và dịch vụ nghỉ dưỡng cao cấp. Tour được thiết kế độc quyền nhằm mang lại cho bạn những phút giây thư giãn tuyệt đối, thưởng thức ẩm thực địa phương đặc sắc và tìm hiểu văn hóa bản địa.",
  amenities: ["Đưa đón tận nơi", "Khách sạn 5 sao", "Bữa sáng Buffet", "Hướng dẫn viên", "Bảo hiểm du lịch", "Wifi miễn phí"],
  itinerary: [
    { day: "Ngày 1", title: "Khởi hành & Nhận phòng", desc: "Xe đón khách tại điểm hẹn. Di chuyển đến resort làm thủ tục nhận phòng. Buổi chiều tự do tắm biển và ăn tối tại nhà hàng cao cấp." },
    { day: "Ngày 2", title: "Khám phá danh thắng", desc: "Tham quan các điểm đến nổi bật trong khu vực. Trải nghiệm các hoạt động văn hóa và thưởng thức đặc sản địa phương." },
    { day: "Ngày 3", title: "Mua sắm & Trở về", desc: "Tự do mua sắm đặc sản làm quà. 12h00 trả phòng và di chuyển về điểm xuất phát. Kết thúc hành trình." }
  ],
  host: {
    name: "VietJourney Premium",
    joined: "2018",
    reviews: 1450,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80",
    description: "Chúng tôi là đơn vị tổ chức tour chuyên nghiệp với hơn 5 năm kinh nghiệm, cam kết mang đến những chuyến đi an toàn, sang trọng và đáng nhớ nhất."
  },
  reviews: [
    { name: "Nguyễn Minh Tuấn", date: "Tháng 4, 2024", rating: 5, comment: "Trải nghiệm vượt ngoài mong đợi! Hướng dẫn viên rất nhiệt tình và chu đáo. Đồ ăn cực kỳ ngon, khách sạn 5 sao sạch sẽ.", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80" },
    { name: "Trần Mai Phương", date: "Tháng 3, 2024", rating: 5, comment: "Gia đình mình đã có một kỳ nghỉ tuyệt vời. Lịch trình hợp lý, không quá mệt mỏi. Trẻ em cũng rất thích các hoạt động tham quan.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80" },
    { name: "Hoàng Văn Thái", date: "Tháng 2, 2024", rating: 4, comment: "Mọi thứ đều hoàn hảo, trừ việc thời tiết ngày đầu hơi mưa nên chụp ảnh không được đẹp lắm. Sẽ quay lại ủng hộ.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" }
  ],
  faqs: [
    { question: "Chi phí tour đã bao gồm vé máy bay chưa?", answer: "Giá tour hiển thị chưa bao gồm vé máy bay khứ hồi. Vui lòng liên hệ nhân viên tư vấn để được hỗ trợ đặt vé với giá ưu đãi." },
    { question: "Có phụ thu gì nếu đi một mình không?", answer: "Nếu bạn đi một mình và yêu cầu phòng đơn, sẽ có phụ thu phòng đơn tùy thuộc vào khách sạn. Nếu bạn đồng ý ở ghép, sẽ không phát sinh thêm." },
    { question: "Chính sách hoàn hủy như thế nào?", answer: "Hủy trước 15 ngày: Hoàn 100%. Hủy trước 7 ngày: Hoàn 50%. Hủy trong vòng 3 ngày: Không hoàn tiền. Lưu ý, các dịp lễ Tết sẽ có chính sách riêng." }
  ]
};

export const mockHomestayDetail = {
  gallery: [
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7def511?w=800&q=80"
  ],
  type: "Toàn bộ căn hộ",
  capacity: { guests: 4, bedrooms: 2, beds: 2, baths: 1 },
  description: "Một không gian nghỉ dưỡng tuyệt vời nằm ẩn mình giữa thiên nhiên. Căn nhà được thiết kế theo phong cách mộc mạc nhưng trang bị đầy đủ tiện nghi hiện đại. Rất thích hợp cho gia đình nhỏ hoặc nhóm bạn muốn tìm một nơi yên tĩnh để thư giãn vào cuối tuần.",
  amenities: [
    { icon: "Wifi", label: "Wifi tốc độ cao miễn phí" },
    { icon: "Coffee", label: "Bếp đầy đủ dụng cụ" },
    { icon: "Tv", label: "TV màn hình phẳng 55 inch" },
    { icon: "Car", label: "Chỗ đỗ xe miễn phí trong khuôn viên" },
    { icon: "Wind", label: "Điều hòa nhiệt độ" },
    { icon: "Waves", label: "Máy giặt & Máy sấy" }
  ],
  rules: [
    "Nhận phòng: Sau 14:00",
    "Trả phòng: Trước 12:00",
    "Không hút thuốc trong nhà",
    "Không tổ chức tiệc tùng/sự kiện",
    "Cho phép mang theo thú cưng (dưới 5kg)"
  ],
  host: {
    name: "Lan Anh",
    joined: "2021",
    reviews: 234,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
    description: "Chào mừng bạn đến với không gian nhỏ của chúng tôi. Hy vọng bạn sẽ có những giây phút thư giãn tuyệt vời tại đây."
  },
  reviews: [
    { name: "Minh Đức", date: "Tháng 5, 2024", rating: 5, comment: "Nhà rất sạch sẽ và đẹp. Vị trí thuận lợi để đi lại. Chị chủ siêu nhiệt tình.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80" },
    { name: "Hải Yến", date: "Tháng 4, 2024", rating: 5, comment: "Góc bếp được trang bị đầy đủ không thiếu thứ gì. Cả nhà mình đã có một kỳ nghỉ cuối tuần hoàn hảo.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80" }
  ]
};

export const blogPosts = [
  {
    id: 1,
    title: "Bí quyết săn mây Tà Xùa: Kinh nghiệm từ A-Z cho người mới",
    excerpt: "Lên kế hoạch hoàn hảo cho chuyến săn mây tại 'thiên đường có thật' Tà Xùa. Thời điểm, phương tiện, và những góc check-in không thể bỏ lỡ.",
    category: "Tips Du Lịch",
    date: "12 Thg 5, 2024",
    readTime: "5 phút đọc",
    coverImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80",
    author: {
      name: "Hoàng Trần",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80"
    },
    content: `
      <p>Tà Xùa từ lâu đã được mệnh danh là 'thiên đường mây' của Tây Bắc. Với những dải mây trắng bồng bềnh ôm trọn các đỉnh núi, nơi đây luôn là điểm đến ao ước của giới trẻ yêu thích xê dịch.</p>
      <h3>1. Thời điểm săn mây lý tưởng nhất</h3>
      <p>Không phải lúc nào lên Tà Xùa cũng có mây. Theo kinh nghiệm của những 'phượt thủ' chuyên nghiệp, khoảng thời gian từ tháng 10 đến tháng 4 năm sau là mùa mây đẹp nhất. Lúc này, độ ẩm cao, nhiệt độ chênh lệch ngày và đêm lớn sẽ tạo nên biển mây dày đặc và lâu tan.</p>
      <h3>2. Phương tiện di chuyển</h3>
      <p>Từ Hà Nội, bạn có thể đi xe khách lên Bắc Yên, sau đó thuê xe máy đi thêm khoảng 15km đường đèo dốc để lên đến trung tâm xã Tà Xùa. Nếu tự lái xe máy từ Hà Nội, hãy chắc chắn bạn có tay lái vững vàng vì đường đi khá nhiều khúc cua tay áo.</p>
      <h3>3. Các điểm check-in không thể bỏ lỡ</h3>
      <p>Đỉnh gió, Sống lưng khủng long Háng Đồng, và Cây táo mèo cô đơn là 3 tọa độ săn mây huyền thoại mà bạn nhất định phải ghé thăm.</p>
    `
  },
  {
    id: 2,
    title: "Hành trình khám phá văn hóa Chăm Pa tại Mỹ Sơn",
    excerpt: "Trở về quá khứ qua những đền tháp rêu phong cổ kính. Tìm hiểu về kiến trúc độc đáo và tín ngưỡng của vương quốc Chăm Pa xưa.",
    category: "Văn Hóa",
    date: "08 Thg 5, 2024",
    readTime: "7 phút đọc",
    coverImage: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=80",
    author: {
      name: "Ngọc Diệp",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"
    },
    content: ""
  },
  {
    id: 3,
    title: "Top 5 quán cà phê ngắm trọn thung lũng Mường Hoa",
    excerpt: "Sapa không chỉ có Fansipan. Hãy cùng khám phá những quán cà phê ẩn mình giữa sườn đồi, nơi bạn có thể vừa nhâm nhi đồ uống, vừa ngắm nhìn ruộng bậc thang tuyệt đẹp.",
    category: "Trải Nghiệm",
    date: "01 Thg 5, 2024",
    readTime: "4 phút đọc",
    coverImage: "https://res.klook.com/image/upload/fl_lossy.progressive,q_60/Mobile/City/nab4excv9bkndhqnsyvl.jpg",
    author: {
      name: "Minh Anh",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80"
    },
    content: ""
  },
  {
    id: 4,
    title: "Cẩm nang du lịch Phú Quốc 4 ngày 3 đêm tự túc",
    excerpt: "Tất tần tật lịch trình, chi phí và địa điểm ăn chơi tại Đảo Ngọc Phú Quốc dành cho nhóm bạn trẻ.",
    category: "Kinh Nghiệm",
    date: "24 Thg 4, 2024",
    readTime: "10 phút đọc",
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Bai-sao-phu-quoc-tuonglamphotos.jpg/960px-Bai-sao-phu-quoc-tuonglamphotos.jpg",
    author: {
      name: "Lê Kiên",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"
    },
    content: ""
  }
];
