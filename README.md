# แบบทดสอบคัดเลือกนักศึกษาฝึกงาน

ตัวอย่างนี้ครอบคลุมโจทย์ทั้ง 4 ส่วน: System Design, Database Design, เว็บจัดการ Task แบบ Mock Data และ Debugging/Code Review

## Tech Stack (ส่วนที่ 3)

- **JavaScript + React 18:** หน้าจอ Login, หน้า Admin/Employee และ state ของผู้ใช้/Task เขียนเป็น component ได้ตรงกับขอบเขตของโจทย์
- **Vite:** มี dev server พร้อมคำสั่งสั้น ๆ สำหรับเปิดเว็บและ build โดยไม่ต้องตั้ง backend
- **React Router:** ใช้แยก `/admin` กับ `/employee` และทำ redirect ตาม Login/role
- **Mock API ที่เขียนเอง:** คืน Promise พร้อมหน่วงเวลาให้แสดง loading และจำลอง error โดยไม่เพิ่ม backend หรือฐานข้อมูล ซึ่งโจทย์ส่วนนี้กำหนดให้ใช้ Mock Data

## วิธีติดตั้งและรัน

ต้องติดตั้ง Node.js 20.19 ขึ้นไป หรือ 22.12 ขึ้นไป และ npm ก่อน จากโฟลเดอร์ `section-3/` เปิด terminal แล้วรัน:

```bash
npm install
npm run dev
```

เปิด URL ที่ Vite แสดงใน terminal (ปกติคือ `http://localhost:5173`) หากใช้ PowerShell จากโฟลเดอร์ราก ให้รัน `cd section-3` ก่อน

## บัญชีทดสอบ

หน้า Login เป็น dropdown เลือกบัญชีและกดเข้าสู่ระบบ:

| Username | Role | ใช้ทดสอบ |
| --- | --- | --- |
| `admin` | Admin | ดู Task ทั้งหมดและสร้าง Task |
| `mali` | Employee | เห็น Task ที่มอบหมายให้ Mali และกด Done |
| `niran` | Employee | เห็นเฉพาะ Task ที่มอบหมายให้ Niran |

เลือก “บัญชีทดสอบ error” เพื่อดูกรณี Mock API ไม่พบบัญชี

## โครงสร้าง

- `section-1/flowchart.md` — Flowchart รูปแบบ Mermaid
- `section-1/DECISIONS.md` — เหตุผลการตัดสินใจ 5 ข้อและการใช้ AI
- `section-2/schema.sql` — Schema PostgreSQL พร้อม constraint และ index
- `section-3/` — React/Vite web app ใช้ Mock Data; ไม่มี backend หรือฐานข้อมูลจริง
- `section-4/` — โค้ดแก้ไขและตารางบั๊กพร้อมวิธีพิสูจน์
- `START.md` — เวลาเริ่มทำแบบทดสอบ

## เปิดดู Flowchart

ไฟล์ `section-1/flowchart.md` เป็น Mermaid. หาก Markdown viewer รองรับ Mermaid สามารถเปิดดูได้โดยตรง; ใน GitHub, วางเนื้อหาใน Markdown fence `mermaid` เพื่อแสดงแผนภาพ.
