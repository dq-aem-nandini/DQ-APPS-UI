'use client';

import React, { useState, useEffect } from 'react';
import { employeeService } from '@/lib/api/employeeService';
import SalaryDetails from '@/components/employee/SalaryDetails';

export default function SalaryPage() {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        setLoading(true);
        const employee = await employeeService.getEmployeeById();
        setEmployeeId(employee.employeeId); // from API response
        console.log('Fetched Employee ID:', employee.employeeId);
      } catch (error) {
        console.error('Failed to fetch employee ID:', error);
        setEmployeeId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeId();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading salary details...</p>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-red-600">Failed to load employee information.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <SalaryDetails employeeId={employeeId} />
    </div>
  );
}