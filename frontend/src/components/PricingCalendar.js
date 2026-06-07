/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import { ownerApi } from '@/lib/api';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import s from '../app/owner/owner.module.css'; // Reuse styles from owner page

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function PricingCalendar({ hotelId, room, onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Selection state
  const [selectedDates, setSelectedDates] = useState([]);
  const [editPrice, setEditPrice] = useState('');
  const [editAvailable, setEditAvailable] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // Get first day of current month
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      // Get last day of current month
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const data = await ownerApi.getRoomAvailability(
        hotelId, 
        room.id, 
        start.toISOString(), 
        end.toISOString()
      );
      setAvailability(data);
    } catch (error) {
      console.error(error);
      alert('Lỗi tải dữ liệu lịch');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDates([]);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDates([]);
  };

  const toggleDateSelection = (dateStr) => {
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleSave = async () => {
    if (selectedDates.length === 0) return;
    
    setSaving(true);
    try {
      const payload = selectedDates.map(date => {
        const item = { date };
        if (editPrice !== '') item.price = Number(editPrice);
        if (editAvailable !== '') item.available = Number(editAvailable);
        return item;
      });
      
      await ownerApi.setRoomAvailability(hotelId, room.id, payload);
      alert('Cập nhật thành công');
      setSelectedDates([]);
      setEditPrice('');
      setEditAvailable('');
      fetchAvailability();
    } catch (error) {
      console.error(error);
      alert('Lỗi cập nhật dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ padding: 10, border: '1px solid transparent' }}></div>);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month, day));
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const availInfo = availability.find(a => new Date(a.date).toISOString().split('T')[0] === dateStr);
      const isSelected = selectedDates.includes(dateStr);
      
      // Default to base values if no availability record
      const price = availInfo ? availInfo.price : room.basePrice;
      const available = availInfo ? availInfo.available : room.totalRooms;
      const booked = availInfo ? availInfo.booked : 0;
      
      const isFull = booked >= available && available > 0;
      const isClosed = available === 0;
      
      let bgColor = '#ffffff';
      if (isSelected) bgColor = '#e0f2fe';
      else if (isClosed) bgColor = '#f1f5f9';
      else if (isFull) bgColor = '#fee2e2';
      
      days.push(
        <div 
          key={dateStr}
          onClick={() => toggleDateSelection(dateStr)}
          style={{ 
            padding: '8px', 
            border: `1px solid ${isSelected ? '#38bdf8' : '#e2e8f0'}`,
            borderRadius: '8px',
            background: bgColor,
            cursor: 'pointer',
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            opacity: date < new Date(new Date().setHours(0,0,0,0)) ? 0.5 : 1 // past dates fade
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14 }}>{day}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            <div style={{ color: '#0d9488', fontWeight: 600 }}>{Number(price).toLocaleString()}₫</div>
            <div style={{ color: isClosed ? '#dc2626' : '#64748b' }}>
              Trống: {available - booked}/{available}
            </div>
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className={s.modalOverlay}>
      <div className={s.modal} style={{ maxWidth: 900 }}>
        <div className={s.panelHeader}>
          <h2 className={s.panelTitle}>Lịch Giá & Phòng: {room.name}</h2>
          <button className={s.secondaryButton} onClick={onClose}><X size={16} /></button>
        </div>
        
        <div style={{ display: 'flex', gap: 24 }}>
          {/* LEFT: CALENDAR */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <button className={s.secondaryButton} onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
              <h3 style={{ fontWeight: 800, fontSize: 16 }}>Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}</h3>
              <button className={s.secondaryButton} onClick={handleNextMonth}><ChevronRight size={16} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#64748b' }}>
              {daysOfWeek.map(d => <div key={d}>{d}</div>)}
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>Đang tải lịch...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                {renderCalendar()}
              </div>
            )}
          </div>
          
          {/* RIGHT: EDIT PANEL */}
          <div style={{ width: 300, background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Cập nhật hàng loạt</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Chọn các ngày trên lịch, sau đó nhập giá hoặc số phòng trống để cập nhật.
            </p>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Đã chọn: <span style={{ color: '#0d9488' }}>{selectedDates.length} ngày</span></div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label className={s.label}>Giá mới (₫)</label>
              <input 
                type="number" 
                className={s.input} 
                value={editPrice} 
                onChange={e => setEditPrice(e.target.value)} 
                placeholder={`Mặc định: ${room.basePrice}`}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label className={s.label}>Phòng trống</label>
              <input 
                type="number" 
                className={s.input} 
                value={editAvailable} 
                onChange={e => setEditAvailable(e.target.value)} 
                placeholder={`Mặc định: ${room.totalRooms} (Nhập 0 để đóng)`}
              />
            </div>
            
            <button 
              className={s.button} 
              style={{ width: '100%' }} 
              onClick={handleSave} 
              disabled={selectedDates.length === 0 || saving}
            >
              {saving ? "Đang lưu..." : "Áp dụng"}
            </button>
            
            <div style={{ marginTop: 24, fontSize: 12, color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 2 }}></div> Bình thường
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, background: '#e0f2fe', border: '1px solid #38bdf8', borderRadius: 2 }}></div> Đang chọn
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 2 }}></div> Đóng phòng
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, background: '#fee2e2', border: '1px solid #e2e8f0', borderRadius: 2 }}></div> Hết phòng
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
