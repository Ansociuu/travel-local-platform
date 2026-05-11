"use client";
import React from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { vi } from 'date-fns/locale';

export default function DatePicker({ ranges, onChange }) {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <DateRange
        locale={vi}
        ranges={ranges}
        onChange={onChange}
        minDate={new Date()}
        rangeColors={['#0d9488']}
        showDateDisplay={false}
        months={1}
        direction="horizontal"
        className="custom-date-range"
      />
    </div>
  );
}
