# Portfolio — Lê Hữu Nguyên

Trang portfolio cá nhân của **Lê Hữu Nguyên** — kỹ sư IoT / Embedded & **TouchDesigner Developer** tại Tp.HCM. Tuyển tập các trải nghiệm tương tác thời gian thực: particle, motion / AI tracking, projection mapping.

🔗 **Live:** https://portfolio-lehuunguyen.netlify.app

---

## ⚙️ Công nghệ
- **HTML / CSS / Vanilla JS** — không cần build step
- **Three.js** — nền 3D: trường sao, lưới địa hình sóng, icosahedron phát sáng, bloom; camera bay + đổi màu theo cuộn
- **GSAP + ScrollTrigger** — hoạt ảnh khi cuộn

## 📁 Cấu trúc
| File | Vai trò |
|------|---------|
| `index.html` | Nội dung + scene Three.js (inline ES module) |
| `style.css`  | Giao diện: glassmorphism, neon, responsive |
| `script.js`  | Tương tác: custom cursor, tilt 3D, lọc dự án, video, đếm số |

## 💻 Chạy cục bộ
Cần một web server (vì dùng ES modules — không mở trực tiếp file):

```bash
python -m http.server 5577
```
Rồi mở http://localhost:5577

## 🎬 Video
Các video demo được host trên **YouTube / Google Drive** và nhúng theo ID — không lưu trong repo để giữ repo gọn nhẹ.

---
© 2026 Lê Hữu Nguyên
