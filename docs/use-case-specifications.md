# Đặc tả Use Case Chi Tiết - Hệ thống VietJourney / MoodTravel

Tài liệu này cung cấp đặc tả phân tích chi tiết cho tất cả các Use Case trong hệ thống, bao gồm từng bước của luồng nghiệp vụ, các quy tắc ràng buộc chặt chẽ và các trường hợp ngoại lệ.

---

## 👤 TÁC NHÂN: KHÁCH HÀNG (USER)

### UC1: Đăng ký tài khoản
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC1 |
| **Use Case Name** | Đăng ký tài khoản |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | Hệ thống (Hệ thống xác thực, Dịch vụ Email) |
| **Mô tả** | Cho phép khách hàng vãng lai tạo mới một tài khoản định danh trên hệ thống để sử dụng các tính năng nâng cao (đặt phòng, bình luận, lưu wishlist). |
| **Tiền điều kiện** | Người dùng đang có kết nối internet và chưa trong trạng thái đăng nhập. |
| **Hậu điều kiện** | Hệ thống tạo ra một bản ghi User mới. Email xác thực được gửi đi. |
| **Kích hoạt** | Người dùng click vào nút "Đăng ký" trên thanh điều hướng. |
| **Luồng chính** | 1. Người dùng chọn chức năng "Đăng ký".<br>2. Hệ thống hiển thị biểu mẫu bao gồm: Họ tên, Số điện thoại, Email, Mật khẩu, Xác nhận mật khẩu.<br>3. Người dùng nhập đầy đủ dữ liệu và nhấn nút "Đăng ký".<br>4. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào (định dạng, bắt buộc).<br>5. Hệ thống truy vấn CSDL để đảm bảo Email và Số điện thoại chưa được sử dụng.<br>6. Hệ thống mã hóa (Hash) mật khẩu bằng thuật toán Bcrypt.<br>7. Hệ thống tạo tài khoản mới với trạng thái `PENDING_VERIFY`.<br>8. Hệ thống sinh mã xác thực (OTP/Token) và kích hoạt dịch vụ gửi Email.<br>9. Hệ thống thông báo thành công và chuyển người dùng sang trang nhập mã xác thực. |
| **Luồng thay thế** | **1.1 Đăng ký bằng Google/Facebook:**<br>1. Tại bước 2 luồng chính, người dùng chọn nút "Tiếp tục với Google/Facebook".<br>2. Hệ thống redirect sang cổng xác thực của OAuth Provider.<br>3. Người dùng cấp quyền truy cập profile cơ bản.<br>4. Hệ thống nhận Callback chứa thông tin (Email, Tên, Avatar).<br>5. Nếu Email chưa tồn tại, tự động tạo tài khoản với trạng thái `ACTIVE` (bỏ qua bước xác thực email). Đăng nhập thành công ngay lập tức. |
| **Luồng ngoại lệ** | - **Dữ liệu không hợp lệ:** Tại bước 4 luồng chính, nếu sai định dạng, hệ thống bôi đỏ trường tương ứng và hiển thị thông báo lỗi chi tiết bên dưới trường dữ liệu.<br>- **Email/SĐT đã tồn tại:** Tại bước 5 luồng chính, hiển thị thông báo "Email hoặc Số điện thoại đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng tính năng Quên mật khẩu."<br>- **Lỗi dịch vụ Email:** Tại bước 8 luồng chính, nếu hệ thống không gửi được email, thông báo "Hệ thống đang bận, vui lòng yêu cầu gửi lại email xác thực sau". Tài khoản vẫn được tạo. |
| **Yêu cầu đặc biệt** | - Thời gian phản hồi kiểm tra dữ liệu < 1 giây.<br>- Mật khẩu khi người dùng gõ vào phải bị ẩn (masking). |
| **Quy tắc nghiệp vụ** | - Mật khẩu tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường và 1 số.<br>- Một Email/SĐT chỉ đại diện cho một tài khoản duy nhất (Unique constraint). |
| **Giao diện minh họa** | Modal Form Đăng ký, tích hợp validation realtime. |

### UC2: Đăng nhập
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC2 |
| **Use Case Name** | Đăng nhập |
| **Tác nhân chính** | Khách hàng (USER), Chủ nhà (OWNER), Quản trị viên (ADMIN) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Xác thực danh tính của người dùng để cấp quyền truy cập vào các module chức năng tương ứng với Role của họ. |
| **Tiền điều kiện** | Người dùng đã có tài khoản trên hệ thống và đang không trong trạng thái đăng nhập. |
| **Hậu điều kiện** | Hệ thống cấp Access Token và Refresh Token; phiên làm việc của người dùng được khởi tạo. |
| **Kích hoạt** | Người dùng click vào nút "Đăng nhập" ở Header. |
| **Luồng chính** | 1. Người dùng chọn "Đăng nhập".<br>2. Hệ thống hiển thị biểu mẫu (Email, Mật khẩu).<br>3. Người dùng nhập thông tin và submit.<br>4. Hệ thống kiểm tra xem các trường đã được nhập chưa.<br>5. Hệ thống truy vấn tài khoản theo Email.<br>6. Hệ thống so sánh (Compare Hash) mật khẩu nhập vào với mật khẩu trong CSDL.<br>7. Hệ thống kiểm tra trạng thái tài khoản (Active/Locked/Pending).<br>8. Hệ thống tạo Access Token (JWT) và lưu vào Cookie/Local Storage.<br>9. Hệ thống chuyển hướng người dùng: Về trang chủ (USER), về Dashboard (OWNER/ADMIN). |
| **Luồng thay thế** | **Đăng nhập bằng Social (Google/Facebook):** Giống luồng đăng ký bằng OAuth. Nếu hệ thống nhận diện Email đã tồn tại, sẽ cấp Token và cho đăng nhập ngay. |
| **Luồng ngoại lệ** | - **Sai Email/Mật khẩu:** Ở bước 5 hoặc 6, nếu sai, hiển thị thông báo chung "Email hoặc mật khẩu không chính xác" (không chỉ đích danh lỗi ở đâu để tránh dò tài khoản).<br>- **Tài khoản bị khóa (Banned):** Ở bước 7, nếu trạng thái là `LOCKED`, chặn đăng nhập và báo: "Tài khoản của bạn đã bị khóa do vi phạm chính sách. Vui lòng liên hệ CSKH."<br>- **Tài khoản chưa xác thực:** Nếu trạng thái `PENDING_VERIFY`, yêu cầu điều hướng sang trang xác thực OTP. |
| **Yêu cầu đặc biệt** | - Có chức năng "Ghi nhớ đăng nhập" (Remember me) kéo dài thời gian sống của Refresh Token lên 30 ngày.<br>- Phải hỗ trợ chống tấn công Brute Force (Giới hạn 5 lần đăng nhập sai/15 phút). |
| **Quy tắc nghiệp vụ** | - Access Token có thời hạn ngắn (ví dụ 30-60 phút). - Refresh Token dùng để cấp lại Access Token mà không cần đăng nhập lại. |
| **Giao diện minh họa** | Form Đăng nhập cơ bản. |

### UC3: Quên mật khẩu & Đặt lại mật khẩu
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC3 |
| **Use Case Name** | Quên mật khẩu & Đặt lại mật khẩu |
| **Tác nhân chính** | Bất kỳ người dùng nào có tài khoản |
| **Tác nhân liên quan** | Hệ thống, Dịch vụ Email/SMS |
| **Mô tả** | Cung cấp luồng khôi phục quyền truy cập an toàn cho người dùng quên mật khẩu bằng cách xác thực qua Email. |
| **Tiền điều kiện** | Người dùng không thể đăng nhập. |
| **Hậu điều kiện** | Mật khẩu cũ bị vô hiệu hóa, mật khẩu mới được cập nhật. |
| **Kích hoạt** | Nhấn vào link "Quên mật khẩu?" tại form Đăng nhập. |
| **Luồng chính** | 1. Hệ thống hiển thị form yêu cầu nhập Email phục hồi.<br>2. Người dùng điền Email đã đăng ký và nhấn "Gửi mã".<br>3. Hệ thống tìm kiếm Email trong CSDL.<br>4. Hệ thống sinh Reset Token (kèm thời gian hết hạn) và gửi vào Email.<br>5. Người dùng kiểm tra Email, click vào link chứa Reset Token.<br>6. Hệ thống xác minh tính hợp lệ và thời hạn của Token.<br>7. Hệ thống hiển thị form Đặt lại mật khẩu (Mật khẩu mới, Xác nhận mật khẩu mới).<br>8. Người dùng nhập mật khẩu mới và submit.<br>9. Hệ thống mã hóa mật khẩu mới, cập nhật vào CSDL, vô hiệu hóa Reset Token cũ.<br>10. Thông báo "Cập nhật mật khẩu thành công" và chuyển về trang Đăng nhập. |
| **Luồng thay thế** | Nếu người dùng nhập mã OTP gồm 6 số thay vì click link: Tại bước 5, người dùng nhập OTP lên màn hình xác thực đang mở. Tiếp tục bước 6. |
| **Luồng ngoại lệ** | - **Email không tồn tại:** Bước 3, hệ thống vẫn báo "Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn." (Tránh tiết lộ việc email có tồn tại hay không).<br>- **Token hết hạn / Không hợp lệ:** Bước 6, báo "Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại". |
| **Yêu cầu đặc biệt** | - Link/OTP gửi đi chỉ có hiệu lực trong 15 phút. |
| **Quy tắc nghiệp vụ** | - Người dùng bị bắt buộc đổi mật khẩu khác với mật khẩu cũ gần nhất. |
| **Giao diện minh họa** | Màn hình "Quên mật khẩu" -> Màn hình "Nhập mã xác nhận/Đặt lại MK". |

### UC4: Xác thực email
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC4 |
| **Use Case Name** | Xác thực email |
| **Tác nhân chính** | Khách hàng (USER), Chủ nhà (OWNER) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Đảm bảo chủ sở hữu tài khoản là chủ sở hữu thực sự của địa chỉ email đã đăng ký. |
| **Tiền điều kiện** | Tài khoản có trạng thái `PENDING_VERIFY`. Mã OTP đã được gửi. |
| **Hậu điều kiện** | Trạng thái tài khoản chuyển thành `ACTIVE`. |
| **Kích hoạt** | Điều hướng tự động sau đăng ký, hoặc click link trong email. |
| **Luồng chính** | 1. Hệ thống hiển thị màn hình yêu cầu nhập mã OTP (6 số).<br>2. Người dùng mở Email lấy mã và nhập vào các ô input.<br>3. Hệ thống đối chiếu mã OTP trong CSDL (hoặc Redis) tương ứng với tài khoản.<br>4. Hệ thống cập nhật status = `ACTIVE`.<br>5. Thông báo "Xác minh thành công, bạn đã có thể bắt đầu sử dụng". |
| **Luồng thay thế** | Người dùng nhấn "Gửi lại mã OTP" trên giao diện -> Hệ thống hủy mã cũ, sinh mã mới và gửi lại email. |
| **Luồng ngoại lệ** | - **Nhập sai mã:** Hệ thống báo "Mã xác thực không chính xác" (Cho phép nhập sai tối đa 5 lần).<br>- **Mã hết hạn:** Báo "Mã xác thực đã hết hạn, vui lòng yêu cầu gửi lại mã mới". |
| **Yêu cầu đặc biệt** | - Giao diện nhập OTP nên tự động nhảy sang ô tiếp theo sau mỗi phím gõ để tăng UX. |
| **Quy tắc nghiệp vụ** | - OTP có hiệu lực 5 phút. Sau 5 lần nhập sai, khóa chức năng xác thực 30 phút. |
| **Giao diện minh họa** | Màn hình OTP Input 6 chữ số. |

### UC5: Tìm kiếm homestay
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC5 |
| **Use Case Name** | Tìm kiếm homestay |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | Hệ thống (Search Engine/DB) |
| **Mô tả** | Luồng tra cứu homestay theo nhiều chiều không gian và thời gian. Đây là tính năng cốt lõi của hệ thống. |
| **Tiền điều kiện** | Không cần đăng nhập. |
| **Hậu điều kiện** | Hiển thị danh sách các thẻ homestay phù hợp tiêu chí. |
| **Kích hoạt** | Người dùng thao tác trên thanh tìm kiếm (Search Bar) tại trang chủ. |
| **Luồng chính** | 1. Người dùng nhập từ khóa địa điểm (Tỉnh/Thành phố, Quận/Huyện, Tên địa danh) vào ô Địa điểm.<br>2. Người dùng mở Date Picker chọn Ngày nhận phòng (Check-in) và Ngày trả phòng (Check-out).<br>3. Người dùng mở Dropdown chọn Số khách (Người lớn, Trẻ em).<br>4. Nhấn nút có biểu tượng Kính lúp (Tìm kiếm).<br>5. Hệ thống tiếp nhận các tham số, thực hiện logic lọc:<br>   - Lọc các homestay nằm tại/gần vị trí tìm kiếm.<br>   - Kiểm tra các homestay có **ít nhất một phòng** đang trống trong toàn bộ khoảng thời gian từ Check-in đến Check-out.<br>   - Kiểm tra tổng sức chứa của các phòng trống đó đủ đáp ứng số lượng khách yêu cầu.<br>6. Hệ thống phân trang (Pagination) dữ liệu.<br>7. Trả kết quả hiển thị dạng Grid (lưới) các thẻ homestay kèm giá trung bình thấp nhất. |
| **Luồng thay thế** | **Tìm kiếm mở rộng với Bộ lọc (Filters):** Tại màn hình kết quả, người dùng check vào các tiện nghi (Hồ bơi, Bếp, Wifi...), khoảng giá (Slider), hoặc loại hình (Biệt thự, Căn hộ, Nhà trên cây) -> Hệ thống lập tức gọi lại API tìm kiếm với các tham số bổ sung và cập nhật lại danh sách. |
| **Luồng ngoại lệ** | - **Không tìm thấy kết quả:** Hệ thống hiển thị "Rất tiếc, không tìm thấy homestay nào phù hợp với yêu cầu của bạn." và đề xuất "Xóa bộ lọc" hoặc gợi ý "Các homestay phổ biến gần đó".<br>- **Lỗi tham số:** Ngày check-out bé hơn check-in -> Tự động vô hiệu hóa lựa chọn trên DatePicker trước khi submit. |
| **Yêu cầu đặc biệt** | - Thời gian query phải cực nhanh (< 500ms). Nên sử dụng caching (Redis) hoặc ElasticSearch cho địa điểm.<br>- Hỗ trợ tìm kiếm gần đúng (Fuzzy search) cho địa điểm. |
| **Quy tắc nghiệp vụ** | - Nếu người dùng không chọn ngày, giá hiển thị trên card là giá mặc định của phòng rẻ nhất. Nếu có chọn ngày, giá hiển thị là tổng giá rẻ nhất khả dụng cho chuỗi ngày đó. |
| **Giao diện minh họa** | Thanh Search Bar nổi, Trang kết quả chia cột (Danh sách + Bản đồ). |

### UC6: Xem chi tiết homestay
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC6 |
| **Use Case Name** | Xem chi tiết homestay |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Cung cấp cái nhìn toàn diện về 1 cơ sở lưu trú trước khi ra quyết định đặt phòng. |
| **Tiền điều kiện** | Có ID hoặc Slug của Homestay hợp lệ. |
| **Hậu điều kiện** | Các thông tin tĩnh và động của homestay được render ra màn hình. |
| **Kích hoạt** | Click vào thẻ (Card) của homestay ở bất kỳ đâu trên hệ thống. |
| **Luồng chính** | 1. Hệ thống điều hướng sang URL `/homestay/{slug}`.<br>2. Hệ thống gọi API lấy dữ liệu chi tiết cơ sở (Tên, Điểm đánh giá, Tổng review, Vị trí chi tiết, Host info).<br>3. Render khu vực Gallery (Lưới 5 ảnh nổi bật, có nút "Xem tất cả ảnh").<br>4. Render mô tả chi tiết, danh sách tiện nghi nổi bật có icon.<br>5. Render khối "Danh sách phòng và khả dụng" (Thực hiện UC7 bên trong).<br>6. Render phần Đánh giá từ khách hàng trước (Phân tích trung bình từng chỉ số: Độ sạch sẽ, Giao tiếp, Vị trí...).<br>7. Render khối Bản đồ chỉ định vị trí homestay.<br>8. Render Nội quy nhà & Chính sách hủy phòng. |
| **Luồng thay thế** | Khách hàng nhấn "Xem tất cả ảnh" -> Mở một Lightbox toàn màn hình để vuốt xem bộ sưu tập ảnh độ phân giải cao. |
| **Luồng ngoại lệ** | - **Homestay bị khóa/Tạm ẩn:** Nếu người dùng truy cập từ link cũ, hệ thống báo "Cơ sở này hiện không nhận khách" và không hiển thị phần chọn phòng.<br>- **Không tìm thấy ID:** Lỗi 404 trang không tồn tại. |
| **Yêu cầu đặc biệt** | - Hình ảnh phải được Lazy load để tối ưu LCP (Largest Contentful Paint). - Trang cần có thẻ Meta chuẩn để tối ưu SEO (Open Graph). |
| **Quy tắc nghiệp vụ** | - Tên Host/Chủ nhà được phép hiển thị, nhưng số điện thoại hoặc email liên hệ có thể bị ẩn cho đến khi đặt phòng thành công để tránh giao dịch ngoài. |
| **Giao diện minh họa** | Layout giống Airbnb: Cột trái nội dung dài, cột phải là bảng chọn ngày/giá (Sticky box). |

### UC7: Xem phòng & giá
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC7 |
| **Use Case Name** | Xem phòng & giá |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Kiểm tra chi tiết từng phòng (Room) trong một cơ sở (Homestay) dựa trên ngày tháng người dùng cung cấp. |
| **Tiền điều kiện** | Đang ở trang chi tiết homestay (UC6). |
| **Hậu điều kiện** | Người dùng biết được chính xác phòng nào còn trống và giá bao nhiêu. |
| **Kích hoạt** | Cuộn xuống khu vực "Chọn phòng", hoặc khi tương tác đổi ngày trên Datepicker của trang chi tiết. |
| **Luồng chính** | 1. Khách hàng sử dụng bộ chọn ngày để nhập lịch cụ thể.<br>2. Khách hàng nhập số lượng người.<br>3. Hệ thống gửi request lên server với tham số: `homestayId`, `checkIn`, `checkOut`, `guests`.<br>4. Server truy xuất tất cả các phòng thuộc `homestayId`.<br>5. Server quét bảng lịch (Availability) để loại trừ các phòng đã có người đặt trong thời gian đó.<br>6. Server tính toán tổng giá của từng phòng khả dụng theo công thức: (Giá cơ bản * Số ngày thường) + (Giá cuối tuần/Lễ * Số ngày đặc biệt).<br>7. Hệ thống trả về danh sách UI các khối phòng. Mỗi khối hiển thị: Tên phòng, Diện tích, Cấu trúc giường, Các tiện nghi riêng của phòng, Tổng giá đã tính toán và Nút "Đặt phòng". |
| **Luồng thay thế** | **Chưa chọn ngày:** Danh sách phòng vẫn hiển thị, nút "Đặt phòng" bị mờ. Giá hiển thị là giá mặc định theo đêm. Có cảnh báo "Vui lòng nhập ngày đi và ngày về để xem giá chính xác và tình trạng phòng". |
| **Luồng ngoại lệ** | - **Hết phòng hoàn toàn:** Hiển thị thông báo lớn "Cơ sở này đã kín phòng trong khoảng thời gian bạn chọn. Vui lòng thử ngày khác."<br>- **Phòng không đủ sức chứa:** Loại bỏ phòng khỏi kết quả hiển thị hoặc làm mờ kèm dòng chữ "Tối đa chỉ được x người". |
| **Yêu cầu đặc biệt** | - Giá phải bóc tách rõ ràng: Giá phòng, Phí dọn dẹp (nếu có), Thuế/Phí dịch vụ. |
| **Quy tắc nghiệp vụ** | - Khi người dùng xem, phòng vẫn CHƯA bị khóa. Có thể có cảnh báo "Có 2 người khác cũng đang xem phòng này" để tăng tỷ lệ chuyển đổi. |
| **Giao diện minh họa** | Danh sách dạng List/Card, mỗi card là một phòng có nút Đặt màu nổi bật. |

### UC8: Xem trên bản đồ
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC8 |
| **Use Case Name** | Xem trên bản đồ |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | API Bản đồ (Google Maps/Mapbox/Leaflet) |
| **Mô tả** | Trực quan hóa vị trí của 1 homestay hoặc nhiều homestay trên giao diện bản đồ. |
| **Tiền điều kiện** | Hệ thống có dữ liệu Vĩ độ (Latitude) và Kinh độ (Longitude). |
| **Hậu điều kiện** | Render thành công bản đồ tương tác. |
| **Kích hoạt** | Bật chế độ "Hiển thị bản đồ" ở trang tìm kiếm, hoặc cuộn đến khối Bản đồ ở trang chi tiết. |
| **Luồng chính** | **Trong trang chi tiết:**<br>1. Hệ thống khởi tạo SDK Bản đồ.<br>2. Center bản đồ vào tọa độ (Lat, Lng) của homestay.<br>3. Đặt một Marker tùy chỉnh tại đó.<br>4. Vẽ một hình tròn bán kính 200m (Circle) xung quanh (nếu cần giấu vị trí chính xác).<br>5. Người dùng có thể zoom in/out để xem đường đi, các địa điểm lân cận (cửa hàng tiện lợi, bến xe). |
| **Luồng thay thế** | **Trong trang tìm kiếm:**<br>1. Center bản đồ vào tọa độ trung tâm của địa phương đang tìm.<br>2. Lặp qua danh sách kết quả homestay hiện tại, vẽ hàng loạt Marker.<br>3. Giá phòng được hiển thị trực tiếp trên text của Marker (VD nhãn ghi "500k").<br>4. Khách hàng click vào 1 Marker, mở ra một Popup hiển thị Tên, Ảnh thu nhỏ và Rating. Click vào Popup sẽ mở sang Tab mới trang chi tiết. |
| **Luồng ngoại lệ** | - **Lỗi tải API Bản đồ:** Nếu quota API hết hoặc rớt mạng, thay thế bản đồ bằng một hình ảnh tĩnh báo lỗi "Không thể tải bản đồ lúc này". |
| **Yêu cầu đặc biệt** | - Tối ưu performance khi render hàng trăm marker (Sử dụng Marker Clustering: gộp các marker gần nhau lại thành một hình tròn ghi số 10, 20...). |
| **Quy tắc nghiệp vụ** | - Để bảo vệ an toàn cho chủ nhà, địa chỉ số nhà chi tiết và vị trí kim chỉ nam tuyệt đối đôi khi chỉ được gửi cho khách *sau khi* đặt phòng thành công. |
| **Giao diện minh họa** | Bản đồ tương tác, nút Zoom, nút xác định vị trí hiện tại của user. |

### UC9: Đặt phòng homestay
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC9 |
| **Use Case Name** | Đặt phòng homestay |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | Hệ thống, Chủ nhà (OWNER - nhận thông báo) |
| **Mô tả** | Quy trình xác nhận mua dịch vụ lưu trú. Quá trình này khóa phòng để tránh overbooking. |
| **Tiền điều kiện** | User ĐÃ ĐĂNG NHẬP. Đã chọn 1 phòng cụ thể với ngày cụ thể (UC7). |
| **Hậu điều kiện** | Bản ghi Đơn đặt (Booking) được tạo trong DB. Trạng thái `PENDING_PAYMENT`. |
| **Kích hoạt** | Click nút "Đặt phòng" tại thẻ thông tin phòng. |
| **Luồng chính** | 1. Hệ thống kiểm tra xem phòng còn trống thật sự không (tránh trường hợp người dùng treo máy từ hôm qua giờ mới bấm).<br>2. Nếu còn, hệ thống cấp khóa tạm thời (Lock/Hold) cho phòng này trong 15 phút bằng Redis TTL.<br>3. Điều hướng người dùng sang trang Checkout.<br>4. Tại trang Checkout, hệ thống hiển thị: Cột trái (Form thông tin liên hệ, ô nhập Ghi chú đặc biệt), Cột phải (Tóm tắt đơn hàng: Tên cơ sở, Tên phòng, Lịch trình, Tổng số đêm, Phân tích giá chi tiết, Tổng tiền cuối cùng).<br>5. Hệ thống cho phép người dùng thay đổi thông tin liên hệ nếu họ đặt giùm người khác.<br>6. Người dùng đọc đồng ý Chính sách hủy phòng và bấm "Tiếp tục thanh toán".<br>7. Hệ thống insert dữ liệu vào DB bảng `Bookings`. Sinh ra `booking_code` duy nhất (VD: VJ-H0912X).<br>8. Chuyển sang luồng Thanh toán (UC10). |
| **Luồng thay thế** | Người dùng có mã giảm giá (UC15), nhập mã tại màn hình Checkout. Tổng tiền được cập nhật realtime ở cột tóm tắt trước khi bấm "Tiếp tục thanh toán". |
| **Luồng ngoại lệ** | - **Bị người khác nẫng tay trên:** Ở bước 1, nếu phát hiện phòng vừa bị lock bởi session khác, chặn lại và thông báo: "Xin lỗi, phòng này vừa được người khác giữ chỗ cách đây ít phút. Vui lòng chọn phòng/ngày khác."<br>- **User chưa đăng nhập:** Nhấn "Đặt phòng" sẽ hiện modal Đăng nhập. Sau khi đăng nhập thành công, tự động tiếp tục luồng Checkout. |
| **Yêu cầu đặc biệt** | - Đếm ngược 15 phút hiển thị rõ trên màn hình Checkout. Khi hết giờ, tự động quay lại trang homestay. |
| **Quy tắc nghiệp vụ** | - Đơn giá lúc Checkout là giá chốt, không bị ảnh hưởng nếu Chủ nhà thay đổi giá sau đó. |
| **Giao diện minh họa** | Layout Checkout chuyên nghiệp 2 cột, rõ ràng về mặt con số tài chính. |

### UC10: Thanh toán (SePay / VietQR)
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC10 |
| **Use Case Name** | Thanh toán |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | Hệ thống, Nền tảng SePay (Bank API) |
| **Mô tả** | Khách hàng chuyển tiền bằng Mobile Banking. Hệ thống xác nhận thanh toán tự động qua Webhook thay vì chờ Admin duyệt tay. |
| **Tiền điều kiện** | Đơn hàng vừa tạo thành công ở trạng thái `PENDING_PAYMENT`. |
| **Hậu điều kiện** | Đơn hàng đổi thành `CONFIRMED`. Lịch trống của phòng bị trừ đi vĩnh viễn. |
| **Kích hoạt** | Hoàn thành UC9, tiếp nối sang màn hình Thanh toán. |
| **Luồng chính** | 1. Hệ thống tạo chuỗi VietQR chuẩn dựa trên STK của nền tảng, Số tiền cần thanh toán, và Nội dung chuyển khoản bắt buộc chứa `booking_code`.<br>2. Hiển thị QRCode ra màn hình cùng thông tin hướng dẫn chi tiết.<br>3. Màn hình chờ chuyển sang trạng thái Polling/Websocket lắng nghe phản hồi.<br>4. Khách hàng mở App Ngân hàng trên điện thoại, quét QR, hệ thống ngân hàng tự điền đủ thông tin. Khách nhấn chuyển.<br>5. Ngân hàng của nền tảng nhận tiền -> Báo biến động số dư cho SePay.<br>6. SePay bắn Webhook chứa nội dung biến động về API Endpoint của hệ thống.<br>7. Hệ thống parse nội dung, tìm `booking_code`, đối chiếu Số tiền thực nhận với Số tiền đơn hàng.<br>8. Nếu khớp hoàn toàn, cập nhật status booking thành `CONFIRMED`.<br>9. Hệ thống gửi WebSocket/SSE update UI màn hình thanh toán của khách thành "Thanh toán thành công".<br>10. Gửi Email/SMS hóa đơn điện tử cho khách, gửi thông báo báo hỷ cho Chủ nhà. |
| **Luồng thay thế** | Khách hàng không dùng máy tính để quét mà dùng điện thoại: Nhấn nút "Copy STK", "Copy Nội dung" để tự chuyển khoản thủ công trên cùng 1 điện thoại. |
| **Luồng ngoại lệ** | - **Thanh toán thiếu tiền:** Ở bước 7, nếu số tiền < tổng đơn, trạng thái đổi thành `PARTIAL_PAID`. Hệ thống tự gửi email/SMS báo khách hàng thanh toán nốt phần thiếu với mã QR bổ sung. Đơn chưa được xác nhận, phòng chỉ lock tạm thời 1-2 tiếng.<br>- **Quá hạn 15 phút chưa nhận được tiền:** Job Scheduler tự động chạy, đánh dấu đơn là `CANCELLED`, nhả phòng về trạng thái trống. Nếu khách lỡ chuyển khoản chậm sau đó, tiền rơi vào quỹ chờ xử lý, Admin phải liên hệ hoàn tiền hoặc book lại thủ công. |
| **Yêu cầu đặc biệt** | - Độ trễ xử lý Webhook phải cực thấp, màn hình phải nhảy thành công trong vòng <10 giây kể từ khi khách trừ tiền. |
| **Quy tắc nghiệp vụ** | - Nội dung chuyển khoản là khóa chính để đối soát tự động. Tuyệt đối không để khách tự sửa nội dung. |
| **Giao diện minh họa** | Trang hiển thị QR Code lớn, đồng hồ đếm ngược, và Loader xoay báo đang chờ nhận tiền. |

### UC11: Xem lịch sử đặt phòng
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC11 |
| **Use Case Name** | Xem lịch sử đặt phòng |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Liệt kê toàn bộ các chuyến đi (bookings) mà người dùng đã thực hiện. |
| **Tiền điều kiện** | Đã đăng nhập. |
| **Hậu điều kiện** | UI hiển thị danh sách đơn hàng được chia theo phân nhóm trạng thái. |
| **Kích hoạt** | Click vào avatar -> Chọn "Chuyến đi của tôi" (My Trips). |
| **Luồng chính** | 1. Hệ thống truy vấn CSDL, lấy ra danh sách các bảng `Bookings` ứng với `userId`. Join để lấy thông tin Homestay, Hình ảnh thumbnail.<br>2. Phân loại đơn thành 3 tab:<br>   - **Sắp tới (Upcoming):** Đơn `CONFIRMED` có ngày check-in > ngày hiện tại.<br>   - **Đã hoàn thành (Completed):** Đơn có ngày check-out <= ngày hiện tại.<br>   - **Đã hủy (Cancelled):** Đơn thất bại hoặc bị hủy bỏ.<br>3. Khách hàng xem danh sách. Có thể click vào "Xem chi tiết" của 1 đơn.<br>4. Trang chi tiết đơn hiển thị: QR code đơn hàng (để check-in), Thông tin chủ nhà (số điện thoại, địa chỉ chính xác), Nút thao tác (Liên hệ chủ nhà, Hủy phòng, hoặc Viết đánh giá). |
| **Luồng thay thế** | Không có. |
| **Luồng ngoại lệ** | Lỗi API: Hiển thị bộ xương tải (Skeleton) và sau đó báo lỗi kỹ thuật "Không thể tải danh sách lúc này". |
| **Yêu cầu đặc biệt** | Cần chia trang (Pagination) để tối ưu truy xuất với những tài khoản book rất nhiều. |
| **Quy tắc nghiệp vụ** | Tại Tab "Sắp tới", cần làm nổi bật đơn hàng gần nhất sẽ đi. |
| **Giao diện minh họa** | Giao diện Dashboard quản lý cá nhân với cấu trúc Tabs. |

### UC12: Hủy đặt phòng
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC12 |
| **Use Case Name** | Hủy đặt phòng |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | Hệ thống, Admin (duyệt hoàn tiền), Chủ nhà |
| **Mô tả** | Người dùng quyết định không tiếp tục chuyến đi và yêu cầu hủy bỏ đơn đặt phòng đã thanh toán hoặc chưa thanh toán. |
| **Tiền điều kiện** | Truy cập vào chi tiết đơn hàng `CONFIRMED` hoặc `PENDING`. Đơn chưa qua ngày check-in. |
| **Hậu điều kiện** | Trạng thái đơn thành `CANCELLED`. Lịch phòng được khôi phục. Tạo yêu cầu hoàn tiền (Refund request) nếu có. |
| **Kích hoạt** | Nhấn nút "Hủy đơn" trong màn hình Chi tiết chuyến đi. |
| **Luồng chính** | 1. Người dùng bấm Hủy đơn.<br>2. Hệ thống kiểm tra khoảng cách từ ngày hiện tại tới ngày Check-in.<br>3. Hệ thống đối chiếu với **Chính sách hủy** của homestay đó (VD: Trước 7 ngày hoàn 100%, 3-7 ngày hoàn 50%, sát ngày hoàn 0%).<br>4. Hệ thống hiển thị Modal cảnh báo: "Bạn đang yêu cầu hủy đơn VJ-H0912. Theo chính sách cơ sở, bạn sẽ được hoàn lại: X VNĐ. Thời gian hoàn tiền từ 3-5 ngày làm việc".<br>5. Khách hàng chọn một lý do hủy (dropdown) và xác nhận.<br>6. Hệ thống cập nhật trạng thái đơn thành `CANCELLED_BY_GUEST`.<br>7. Hệ thống tự động xóa khóa lịch đặt phòng, nhả phòng về trạng thái có sẵn.<br>8. Nếu số tiền hoàn X > 0, hệ thống tạo bản ghi `Refund_Requests` gửi lên cho Admin xử lý chuyển khoản lại.<br>9. Gửi Email thông báo cho khách và Chủ nhà về việc đơn bị hủy. |
| **Luồng thay thế** | Nếu đơn ở trạng thái `PENDING_PAYMENT` (chưa thanh toán): Quá trình hủy diễn ra ngay lập tức không có bước tính toán hoàn tiền. Trạng thái về `CANCELLED`. |
| **Luồng ngoại lệ** | **Đã quá hạn hủy (Sát giờ check-in):** Nếu chính sách không cho phép hủy, hệ thống mờ nút "Hủy đơn" hoặc hiển thị Modal: "Bạn không thể hủy đơn này do đã vi phạm chính sách thời gian. Liên hệ CSKH để được hỗ trợ đặc biệt". |
| **Yêu cầu đặc biệt** | Log lại dấu vết (audit log) thời điểm khách bấm hủy tính tới giây để tránh tranh chấp chính sách. |
| **Quy tắc nghiệp vụ** | Chủ nhà không nhận được tiền (hoặc nhận % phạt) tùy theo quy định khi khách hủy. Nền tảng có thể thu phí giao dịch. |
| **Giao diện minh họa** | Modal Hủy phòng với biểu đồ tiến trình thời gian chính sách hủy. |

*(Tương tự cho các UC13, 14, 15 liên quan đến Tour và Coupon với logic cốt lõi giống Homestay nhưng khác tham số...)*

### UC16: Đánh giá & Nhận xét
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC16 |
| **Use Case Name** | Đánh giá & Nhận xét |
| **Tác nhân chính** | Khách hàng (USER) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Cung cấp feedback (sao và text) sau trải nghiệm thực tế. |
| **Tiền điều kiện** | Đơn hàng phải ở trạng thái `COMPLETED` (Đã check-out thành công). |
| **Hậu điều kiện** | Review được tạo. Điểm đánh giá trung bình của homestay/tour được tính lại. |
| **Kích hoạt** | Nút "Viết đánh giá" ở thẻ Đơn hàng đã hoàn thành, hoặc link đính kèm trong email nhắc nhở sau chuyến đi. |
| **Luồng chính** | 1. Hệ thống hiển thị Form đánh giá.<br>2. Người dùng chọn rating tổng quan (1-5 sao).<br>3. Người dùng chọn rating cho từng tiêu chí phụ (Sạch sẽ, Phục vụ, Giá trị, Vị trí).<br>4. Người dùng viết nội dung văn bản (bắt buộc/không bắt buộc).<br>5. Cho phép upload tối đa 5 hình ảnh thực tế.<br>6. Bấm "Gửi".<br>7. Hệ thống lưu Review với trạng thái `PUBLIC` (hoặc `PENDING_MODERATION` nếu hệ thống cài đặt kiểm duyệt AI tự động).<br>8. Job nền chạy ngầm: Tính lại trung bình điểm của homestay (Toán học: `(Tổng điểm cũ * số lượt + điểm mới) / (số lượt + 1)`). |
| **Luồng thay thế** | Không có. |
| **Luồng ngoại lệ** | **Cố tình đánh giá lại:** Nếu User đã đánh giá đơn này rồi, hệ thống chặn tải form và báo "Bạn đã gửi đánh giá cho chuyến đi này rồi." |
| **Yêu cầu đặc biệt** | Dữ liệu Review ảnh hưởng lớn đến xếp hạng hiển thị, cần lưu vào CSDL nhanh nhất. Hình ảnh upload cần qua nén dung lượng tự động. |
| **Quy tắc nghiệp vụ** | Người chưa bao giờ book hoặc hủy phòng không thể viết đánh giá. Đây là chính sách "Verified Reviews". |
| **Giao diện minh họa** | Form chứa các icon ngôi sao có hiệu ứng hover, kèm khu vực upload ảnh kéo thả. |

---

## 🏠 TÁC NHÂN: CHỦ NHÀ (OWNER)

### UC20: Đăng ký làm Owner
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC20 |
| **Use Case Name** | Đăng ký làm Owner |
| **Tác nhân chính** | Chủ nhà tiềm năng (User thông thường) |
| **Tác nhân liên quan** | Quản trị viên (ADMIN) |
| **Mô tả** | Chuyển đổi trạng thái từ người dùng thường sang Đối tác (Chủ nhà) để được cấp quyền quản lý cơ sở trên hệ thống. (Luồng KYC - Know Your Customer). |
| **Tiền điều kiện** | Tài khoản user đã xác thực email/sđt. |
| **Hậu điều kiện** | Đơn đăng ký lưu DB, chờ Admin xử lý. |
| **Kích hoạt** | Nút "Trở thành đối tác / Đón khách cùng VietJourney" ở Footer/Header. |
| **Luồng chính** | 1. Hệ thống điều hướng tới trang Landing Page giới thiệu lợi ích làm Host.<br>2. Người dùng nhấn "Bắt đầu ngay".<br>3. Hệ thống mở chuỗi Form nhiều bước (Wizard Flow).<br>   - Bước 1: Thông tin cá nhân/doanh nghiệp (Họ tên, SĐT, Địa chỉ).<br>   - Bước 2: Tải lên giấy tờ định danh (CCCD mặt trước/sau hoặc GPKD).<br>   - Bước 3: Thông tin nhận thanh toán (Ngân hàng, STK, Tên chủ thẻ).<br>4. Submit hệ thống.<br>5. Đánh dấu người dùng có `is_partner_requested = true`. Báo thành công "Đơn của bạn đang được xét duyệt trong 24h". |
| **Luồng thay thế** | Người dùng có thể thoát giữa chừng ở các bước, hệ thống lưu draft (bản nháp). Lần sau vào làm tiếp. |
| **Luồng ngoại lệ** | Tải lên file quá giới hạn (VD > 5MB) hoặc sai định dạng -> Báo lỗi "Chỉ hỗ trợ PNG/JPG dưới 5MB". |
| **Yêu cầu đặc biệt** | Các giấy tờ tùy thân phải được bảo mật cao, mã hóa ổ cứng hoặc lưu trên private S3 bucket. |
| **Quy tắc nghiệp vụ** | Chỉ Admin mới có đặc quyền thay đổi Role thành OWNER sau khi kiểm tra bằng mắt. |
| **Giao diện minh họa** | Stepper / Wizard form với progress bar. |

### UC21: Quản lý homestay (Đăng Listing)
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC21 |
| **Use Case Name** | Quản lý homestay (Đăng Listing) |
| **Tác nhân chính** | Chủ nhà (OWNER) |
| **Tác nhân liên quan** | Admin (duyệt listing) |
| **Mô tả** | Owner cung cấp dữ liệu về cơ sở lưu trú của mình lên nền tảng. Bao gồm thao tác Create, Read, Update, Delete (CRUD). |
| **Tiền điều kiện** | Người dùng có Role là `OWNER`. Đang ở giao diện Host Dashboard. |
| **Hậu điều kiện** | Một bản ghi Homestay được tạo/cập nhật, trạng thái `PENDING_APPROVAL`. |
| **Kích hoạt** | Click "Thêm cơ sở mới" trong Dashboard. |
| **Luồng chính** | 1. Khởi động form đăng bài gồm nhiều section:<br>   - **Tổng quan:** Tên homestay, Phân loại (Chung cư, Biệt thự...), Mô tả giới thiệu.<br>   - **Vị trí:** Tỉnh, Huyện, Xã, Địa chỉ cụ thể. Form tích hợp bản đồ để Owner thả ghim đánh dấu tọa độ.<br>   - **Tiện nghi:** Bảng danh sách checkbox (Wifi, Bếp, Hồ bơi, Thú cưng...).<br>   - **Hình ảnh:** Giao diện upload ảnh hàng loạt. Cần chỉ định 1 ảnh làm Cover (Thumbnail chính).<br>   - **Chính sách:** Thời gian check-in/out, chính sách hủy mặc định.<br>2. Bấm "Lưu và Gửi duyệt".<br>3. Hệ thống validate toàn bộ dữ liệu. Đẩy ảnh lên Cloud Storage (Cloudinary/AWS).<br>4. Tạo bản ghi trạng thái `PENDING`. |
| **Luồng thay thế** | **Sửa thông tin (Update):** Owner vào homestay đang hoạt động, sửa tên hoặc địa chỉ. Hệ thống tự động chuyển trạng thái về `PENDING` để Admin duyệt lại, tránh việc đổi tên thành nội dung xấu. |
| **Luồng ngoại lệ** | Form bị bỏ trống trường bắt buộc -> Focus vào trường đó và báo lỗi. |
| **Yêu cầu đặc biệt** | UX tốt: tự động lưu nháp liên tục (Auto-save) để tránh rớt mạng mất công nhập liệu dài. |
| **Quy tắc nghiệp vụ** | Homestay phải có ít nhất 5 ảnh minh họa. |
| **Giao diện minh họa** | Form có thanh Menu dọc (Left sidebar) để chuyển qua lại giữa các mục điền. |

### UC22: Quản lý phòng & lịch trống
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC22 |
| **Use Case Name** | Quản lý phòng & lịch trống |
| **Tác nhân chính** | Chủ nhà (OWNER) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Thao tác thiết lập inventory (kho hàng) chi tiết: Khai báo số lượng phòng, thiết lập lịch giá và khóa ngày bận. |
| **Tiền điều kiện** | Đã tạo thành công UC21. |
| **Hậu điều kiện** | Dữ liệu phòng có sẵn để khách hàng book. |
| **Kích hoạt** | Chọn homestay, bấm "Quản lý phòng" / "Lịch". |
| **Luồng chính** | **1. Thêm phòng:** Khai báo Tên phòng, Số lượng khách tối đa, Loại giường, Số lượng phòng cùng loại, Giá cơ bản mặc định. <br>**2. Quản lý Lịch (Calendar):**<br>   - Giao diện hiển thị lịch full-width 1 tháng.<br>   - Owner dùng chuột bôi đen các ngày (ví dụ từ mùng 1 đến mùng 5).<br>   - Một panel mở ra bên phải. Owner chọn hành động:<br>     - "Đổi giá": Đặt giá cao hơn cho dịp Tết.<br>     - "Khóa phòng": Đánh dấu là đã có khách đặt ngoài hệ thống (Block dates).<br>   - Bấm lưu. Hệ thống update bảng `Room_Availability`. |
| **Luồng thay thế** | Không. |
| **Luồng ngoại lệ** | Owner cố khóa phòng vào ngày đã có đơn hàng của khách VietJourney đặt -> Hệ thống báo đỏ "Không thể khóa do đã có khách book". |
| **Yêu cầu đặc biệt** | Calendar UI cần hoạt động mượt mà, hỗ trợ thao tác kéo thả (Drag & Drop) nhiều ngày. |
| **Quy tắc nghiệp vụ** | Nếu Owner sở hữu nhiều phòng chung loại (Ví dụ: 3 phòng Standard), hệ thống sẽ từ chối khách nếu số lượng đơn đặt vượt quá 3 trong cùng 1 ngày. |
| **Giao diện minh họa** | Full Calendar tương tự hệ thống quản lý khách sạn PMS. |

### UC24: Quản lý & Xem đơn đặt của khách
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC24 |
| **Use Case Name** | Quản lý & Xem đơn đặt của khách |
| **Tác nhân chính** | Chủ nhà (OWNER) |
| **Tác nhân liên quan** | Khách hàng |
| **Mô tả** | Nơi Chủ nhà xử lý các nghiệp vụ nhận khách hàng ngày. |
| **Tiền điều kiện** | Có đơn hàng phát sinh vào cơ sở của Owner. |
| **Hậu điều kiện** | Trạng thái đơn và phản hồi được cập nhật. |
| **Kích hoạt** | Truy cập menu "Danh sách đơn đặt". |
| **Luồng chính** | 1. Hệ thống hiển thị Data Table các đơn đặt. Cột hiển thị: Mã Booking, Khách, Ngày Check-in/out, Doanh thu, Trạng thái.<br>2. Owner lọc các đơn "Sắp check-in hôm nay".<br>3. Owner nhấn vào chi tiết đơn, xem các yêu cầu đặc biệt của khách (VD: Nhận phòng sớm, Có em bé).<br>4. Owner có thể chủ động nhắn tin (UC18) hoặc gọi điện cho khách.<br>5. Khi khách trả phòng thành công, Owner (nếu được cấp quyền) có thể đánh dấu "Hoàn thành" thủ công, hoặc hệ thống tự động quét qua ngày check-out đổi trạng thái thành `COMPLETED`. |
| **Luồng thay thế** | **Xử lý sự cố / Hủy đơn:** Nếu cơ sở bị hỏng hóc đột xuất (Cháy nổ, hỏng điện nước), Owner buộc phải bấm "Từ chối/Hủy đơn". Hệ thống yêu cầu nhập lý do bắt buộc và chuyển thông tin cho Admin xử lý đền bù khách. |
| **Luồng ngoại lệ** | Không. |
| **Yêu cầu đặc biệt** | Bảng cần hỗ trợ Realtime, đơn mới nhảy vào không cần reload (Sử dụng SSE/Socket). |
| **Quy tắc nghiệp vụ** | Owner tự ý hủy đơn đã thanh toán quá 3 lần/tháng sẽ bị phạt khóa tài khoản, hạ ranking tìm kiếm. |
| **Giao diện minh họa** | Bảng quản trị Booking DataGrid. |

### UC25: Thống kê doanh thu (Dashboard)
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC25 |
| **Use Case Name** | Thống kê doanh thu |
| **Tác nhân chính** | Chủ nhà (OWNER) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Trực quan hóa số liệu kinh doanh để Owner ra quyết định giá cả, marketing. |
| **Tiền điều kiện** | Không. |
| **Hậu điều kiện** | Hiển thị Chart. |
| **Kích hoạt** | Load trang Dashboard chính. |
| **Luồng chính** | 1. Owner chọn bộ lọc thời gian: Tháng hiện tại, Quý 1, Quý 2...<br>2. API tính toán các chỉ số: Tổng doanh thu (sau khi trừ phí hoa hồng nền tảng), Số lượng phòng đã bán, Tỷ lệ lấp đầy (Occupancy Rate).<br>3. Render 3 khối widget hiển thị số liệu tổng quát.<br>4. Render 1 Line Chart (Biểu đồ đường) hiển thị biến động doanh thu theo từng ngày.<br>5. Render bảng Top phòng bán chạy nhất. |
| **Luồng thay thế** | Nhấn "Xuất báo cáo" -> Backend sinh file Excel/CSV tải về máy. |
| **Luồng ngoại lệ** | Dữ liệu quá lớn gây timeout -> Phải có bảng tổng hợp định kỳ ở DB (Data Warehouse) thay vì count trực tiếp. |
| **Yêu cầu đặc biệt** | Giao diện phải đẹp và truyền cảm hứng. |
| **Quy tắc nghiệp vụ** | Doanh thu chỉ được tính trên những đơn đã `COMPLETED`. Đơn Hủy không được tính vào doanh thu. |
| **Giao diện minh họa** | Dashboard với Chart.js/Recharts. |

---

## 🔧 TÁC NHÂN: QUẢN TRỊ VIÊN (ADMIN)

### UC27: Quản lý người dùng
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC27 |
| **Use Case Name** | Quản lý người dùng |
| **Tác nhân chính** | Quản trị viên (ADMIN) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Công cụ cao nhất để duy trì trật tự cộng đồng nền tảng. Xử lý các tài khoản vi phạm hoặc cấp quyền nâng cao. |
| **Tiền điều kiện** | Đăng nhập bằng tài khoản có Role `ADMIN` hoặc `SUPER_ADMIN`. |
| **Hậu điều kiện** | Trạng thái/Quyền tài khoản thay đổi. |
| **Kích hoạt** | Menu "Người dùng" bên Admin Panel. |
| **Luồng chính** | 1. Xem danh sách hàng ngàn Users. Sử dụng công cụ Search theo Email hoặc SĐT.<br>2. Xem chi tiết User: Các homestay đã book, Các report (báo cáo xấu) từ người khác, Lịch sử truy cập.<br>3. Bấm "Khóa tài khoản" (Ban/Suspend). Nhập lý do (VD: Scam, Spam review).<br>4. Hệ thống cập nhật `status = BANNED`. Xóa toàn bộ token hợp lệ hiện tại của User để buộc họ văng ra ngoài. |
| **Luồng thay thế** | Bấm "Sửa quyền" -> Đổi Role từ USER lên OWNER hoặc ADMIN (trong trường hợp tuyển nhân sự mới). |
| **Luồng ngoại lệ** | - Admin không thể xóa/khóa Super Admin cao nhất.<br>- Khóa nhầm -> Có nút "Mở khóa" khôi phục hoạt động bình thường. |
| **Yêu cầu đặc biệt** | Có log ghi lại Admin nào đã khóa User nào vào lúc nào. |
| **Quy tắc nghiệp vụ** | Khi user bị khóa, toàn bộ các listing homestay (nếu là Owner) cũng tự động bị ẩn khỏi nền tảng tìm kiếm. |
| **Giao diện minh họa** | Bảng User Admin. |

### UC28: Duyệt Listing (Homestay/Tour)
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC28 |
| **Use Case Name** | Duyệt Listing (Homestay/Tour) |
| **Tác nhân chính** | Quản trị viên (ADMIN) |
| **Tác nhân liên quan** | Chủ nhà (OWNER) |
| **Mô tả** | Đảm bảo rác/thông tin sai lệch không xuất hiện trên hệ thống public. Thực hiện kiểm soát nội dung (Content Moderation). |
| **Tiền điều kiện** | Có Homestay/Tour đang ở trạng thái `PENDING_APPROVAL`. |
| **Hậu điều kiện** | Listing xuất hiện công khai trên search hoặc bị trả về. |
| **Kích hoạt** | Vào mục "Duyệt nội dung". |
| **Luồng chính** | 1. Admin thấy danh sách các bản nháp đang chờ.<br>2. Bấm vào xem 1 cơ sở. Hệ thống hiển thị mô phỏng giao diện y hệt như khách hàng xem.<br>3. Admin kiểm tra hình ảnh (có chứa SĐT che giấu không?), kiểm tra nội dung mô tả (có chứa từ khóa cấm/link bậy không?).<br>4. Admin thao tác chọn "Duyệt" (Approve).<br>5. Trạng thái cơ sở đổi thành `ACTIVE`. Gửi notification/email chúc mừng Owner. Cơ sở bắt đầu hiển thị trên bộ máy tìm kiếm của khách hàng. |
| **Luồng thay thế** | **Từ chối (Reject):** Ở bước 4, Admin chọn "Từ chối". Bắt buộc nhập khung text lý do: "Hình ảnh mờ, vi phạm chính sách chia sẻ SĐT". Trạng thái đổi thành `REJECTED`. Chủ nhà nhận email và vào sửa lại thông tin gửi duyệt tiếp. |
| **Luồng ngoại lệ** | Không có. |
| **Yêu cầu đặc biệt** | Hệ thống cảnh báo tự động: Dùng Regex/AI quét qua nội dung mô tả, nếu phát hiện sđt/email thì bôi vàng để Admin chú ý kỹ. |
| **Quy tắc nghiệp vụ** | Homestay đã duyệt, nếu Owner sửa đổi Tên/Địa chỉ sẽ bị đưa về trạng thái chờ duyệt lại một phần. |
| **Giao diện minh họa** | Giao diện Review Tool (Bên trái nội dung, bên phải form Action). |

### UC31: Xử lý Tranh chấp / Quản lý đơn đặt
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC31 |
| **Use Case Name** | Xử lý Tranh chấp / Quản lý đơn đặt toàn hệ thống |
| **Tác nhân chính** | Quản trị viên (ADMIN - CSKH) |
| **Tác nhân liên quan** | Khách, Chủ nhà |
| **Mô tả** | Admin đóng vai trò trọng tài để giải quyết khi khách phàn nàn cơ sở thực tế sai khác ảnh, hoặc chủ nhà báo khách phá hoại. Quản lý việc Hoàn tiền (Refund). |
| **Tiền điều kiện** | Nhận yêu cầu từ Hotline/Ticket. |
| **Hậu điều kiện** | Đơn được giải quyết, tiền được điều phối (Hoàn cho khách hoặc chuyển cho Chủ nhà). |
| **Kích hoạt** | Tra cứu mã Booking bằng công cụ tìm kiếm Admin. |
| **Luồng chính** | 1. Admin vào "Tất cả đơn hàng". Nhập mã đơn (VD VJ-H0912).<br>2. Xem nhật ký toàn bộ sự kiện: Đặt lúc nào, thanh toán mấy giờ, ai nhắn tin gì.<br>3. Tùy theo quyết định của ban CSKH, Admin có quyền ghi đè (Override) trạng thái đơn.<br>4. Nếu xử thắng cho Khách: Bấm nút "Hủy và Hoàn tiền 100%". Hệ thống kích hoạt API cổng thanh toán để charge back, hoặc đưa vào luồng Kế toán chuyển thủ công. Trạng thái thành `REFUNDED`.<br>5. Ghi chú log xử lý để có cơ sở đối soát sau này. |
| **Luồng thay thế** | Không. |
| **Luồng ngoại lệ** | Không thể hoàn tiền tự động qua API cổng thanh toán -> Thông báo Admin chuyển khoản thủ công và cập nhật nút "Đã chuyển tiền tay". |
| **Yêu cầu đặc biệt** | Quyền can thiệp đơn hàng là quyền nhạy cảm cao, chỉ Admin cấp quản lý mới được duyệt hoàn tiền. |
| **Quy tắc nghiệp vụ** | Hệ thống giữ tiền (Hold money) của khách. Chỉ thanh toán lại tiền (Payout) cho Chủ nhà sau khi khách đã Check-in (hoặc Check-out) 24h để đảm bảo có thời gian xử lý khiếu nại. |
| **Giao diện minh họa** | Giao diện Ticket / Booking Timeline trong Admin. |

### UC34: Quản lý chiến dịch Khuyến mãi (Coupon)
| Thuộc tính | Mô tả |
|---|---|
| **Use Case ID** | UC34 |
| **Use Case Name** | Quản lý mã giảm giá |
| **Tác nhân chính** | Quản trị viên (ADMIN - Marketing) |
| **Tác nhân liên quan** | Hệ thống |
| **Mô tả** | Setup các chương trình kích cầu mua sắm. |
| **Tiền điều kiện** | Không. |
| **Hậu điều kiện** | Mã được kích hoạt và khách có thể nhập. |
| **Kích hoạt** | Menu "Marketing / Mã giảm giá". |
| **Luồng chính** | 1. Bấm "Tạo Coupon mới".<br>2. Cấu hình các tham số cực kỳ chi tiết:<br>   - Mã Code: Text tự định nghĩa (VD: TET2025).<br>   - Kiểu giảm: Theo % (VD 10%) hoặc Số tiền cố định (VD 100.000đ).<br>   - Giảm tối đa: (Max discount limit cho kiểu %).<br>   - Điều kiện áp dụng: Đơn tối thiểu bao nhiêu tiền.<br>   - Số lượng phát hành: Tổng số lần được nhập.<br>   - Thời gian: Bắt đầu, Kết thúc.<br>3. Lưu hệ thống.<br>4. Mã khả dụng lập tức. |
| **Luồng thay thế** | Admin có thể tạm dừng (Deactivate) một mã đang chạy nếu thấy nghi ngờ gian lận hoặc cháy ngân sách sớm. |
| **Luồng ngoại lệ** | Thiết lập sai logic (Giảm 120%) -> Form validate chặn lại. |
| **Yêu cầu đặc biệt** | Cơ chế tính toán giỏ hàng (Cart Service) phải bảo mật, chặn triệt để lỗ hổng nhập 2 mã cùng lúc (Race condition). |
| **Quy tắc nghiệp vụ** | Mã đã phát sinh lượt sử dụng sẽ bị khóa toàn bộ các trường sửa đổi giá trị, chỉ được đổi ngày kết thúc hoặc trạng thái. |
| **Giao diện minh họa** | Form setup Coupon logic đa điều kiện. |
