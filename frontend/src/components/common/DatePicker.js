import React from 'react';
import DatePicker from 'react-datepicker';
import { FiCalendar } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatePicker = ({ 
  selected, 
  onChange, 
  placeholder = "Select date",
  minDate = null,
  maxDate = null,
  disabled = false,
  className = "",
  showTimeSelect = false,
  timeFormat = "HH:mm",
  timeIntervals = 15,
  dateFormat = "MMM dd, yyyy",
  ...props 
}) => {
  return (
    <div className={`relative ${className}`}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        dateFormat={showTimeSelect ? `${dateFormat} HH:mm` : dateFormat}
        placeholderText={placeholder}
        className="input-field pl-10"
        wrapperClassName="w-full"
        {...props}
      />
      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default CustomDatePicker;
