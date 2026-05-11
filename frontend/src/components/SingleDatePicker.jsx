"use client";
import React from 'react';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css'; 
import { vi } from 'date-fns/locale';

export default function SingleDatePicker({ date, onChange }) {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Calendar
        locale={vi}
        date={date}
        onChange={onChange}
        minDate={new Date()}
        color="#0d9488"
        className="custom-date-range"
      />
    </div>
  );
}
