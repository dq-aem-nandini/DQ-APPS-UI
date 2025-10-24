// components/employee/TimeSheetRegister.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

import { leaveService } from '@/lib/api/leaveService';

import dayjs from 'dayjs';
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { HolidayCalendarDTO, EmployeeLeaveDayDTO, TimeSheetResponseDto, TimeSheetModel } from '@/lib/api/types';
import { holidaysService } from '@/lib/api/holidayService';
import { timesheetService } from '@/lib/api/timeSheetService';

interface TaskRow {
  id: string;
  taskName: string;
  hours: Record<string, number>;
  timesheetIds?: Record<string, string>;
  _dirty?: boolean;
}

const TimeSheetRegister: React.FC = () => {
  const { state } = useAuth();
  const userId = state.user?.userId ?? null;

  const [weekStart, setWeekStart] = useState(() =>
    dayjs().startOf('week').add(1, 'day')
  ); // Monday
  const [selectedDate, setSelectedDate] = useState(weekStart.format('YYYY-MM-DD'));
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [holidayMap, setHolidayMap] = useState<Record<string, HolidayCalendarDTO>>({});
  const [leaveMap, setLeaveMap] = useState<Record<string, string>>({}); // date -> leaveCategory
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  // Inline message panel (replaces alert())
  const [messages, setMessages] = useState<{ id: string; type: 'success'|'error'|'info'; text: string }[]>([]);
  const pushMessage = (type: 'success'|'error'|'info', text: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    setMessages(prev => [...prev, { id, type, text }]);
    setTimeout(() => setMessages(prev => prev.filter(m => m.id !== id)), 6000);
  };

  // Confirm modal state
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; rowIndex: number | null }>({ open: false, rowIndex: null });
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [deletingRowIndex, setDeletingRowIndex] = useState<number | null>(null); // For loading state on delete

  const currentYear = weekStart.format('YYYY');
  const weekDates = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => weekStart.add(i, 'day')),
    [weekStart]
  );

  // Handle date selection and snap to week Monday
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = dayjs(e.target.value);
    if (date.isValid()) {
      const monday = date.startOf('week').add(1, 'day'); // Monday
      setWeekStart(monday);
      setSelectedDate(monday.format('YYYY-MM-DD'));
    }
  };

  // 🔹 Fetch holidays
  const fetchHolidays = useCallback(async () => {
    try {
      const response = await holidaysService.getAllCalendars();
      if (!response.flag || !response.response) {
        throw new Error(response.message || 'Failed to fetch holidays');
      }
      const holidays: HolidayCalendarDTO[] = response.response;
      const map: Record<string, HolidayCalendarDTO> = {};
      holidays.forEach((h: HolidayCalendarDTO) => {
        if (h.holidayActive)
          map[dayjs(h.holidayDate).format('YYYY-MM-DD')] = h;
      });
      setHolidayMap(map);
    } catch (err) {
      console.error('Error fetching holidays', err);
      pushMessage('error', 'Failed to fetch holidays');
    }
  }, []);

  // 🔹 Fetch approved leaves for the year
  const fetchLeaves = useCallback(async (year: string) => {
    try {
      const leaves: EmployeeLeaveDayDTO[] = await leaveService.getApprovedLeaves(year);
      const map: Record<string, string> = {};

      leaves.forEach((l: EmployeeLeaveDayDTO) => {
        map[dayjs(l.date).format('YYYY-MM-DD')] = l.leaveCategory;
      });

      setLeaveMap(map);
    } catch (err) {
      console.error('Error fetching leaves', err);
      pushMessage('error', 'Failed to fetch leaves');
    }
  }, []);

  // 🔹 Fetch weekly timesheets
  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const params = {
        startDate: weekStart.format('YYYY-MM-DD'),
        endDate: weekStart.clone().add(6, 'day').format('YYYY-MM-DD'),
      };
      const response = await timesheetService.getAllTimesheets({ startDate: params.startDate, endDate: params.endDate });
      if (!response.flag || !response.response) {
        throw new Error(response.message || 'Failed to fetch timesheets');
      }
      const list: TimeSheetResponseDto[] = response.response;

      // Set locked state based on statuses
      setIsLocked(list.length > 0 && list.every(item => item.status === 'Submitted'));

      // Map backend TimeSheetResponseDto => frontend TimeSheetModel (without status)
      const mappedList: TimeSheetModel[] = list.map((item: TimeSheetResponseDto) => ({
        timesheetId: item.timesheetId ?? '',
        workDate: item.workDate ?? '',
        hoursWorked: item.workedHours ?? 0,
        taskName: item.taskName ?? '',
        taskDescription: item.taskDescription ?? '',
      }));

      const grouped: Record<string, TaskRow> = {};
      mappedList.forEach(item => {
        const date = dayjs(item.workDate).format('YYYY-MM-DD');
        const task = item.taskName || 'Untitled';
        if (!grouped[task]) {
          grouped[task] = {
            id: task + Math.random().toString(16).slice(2, 6),
            taskName: task,
            hours: {},
            timesheetIds: {},
          };
        }
        grouped[task].hours[date] = Number(item.hoursWorked || 0);
        if (item.timesheetId)
          grouped[task].timesheetIds![date] = item.timesheetId;
      });

      const finalRows = Object.values(grouped);
      if (finalRows.length === 0) {
        finalRows.push({
          id: 'row0',
          taskName: '',
          hours: Object.fromEntries(weekDates.map(d => [d.format('YYYY-MM-DD'), 0])),
        });
      }
      setRows(finalRows);
    } catch (err) {
      console.error('Failed to fetch timesheet', err);
      pushMessage('error', 'Failed to fetch timesheets');
      setIsLocked(false);
    } finally {
      setLoading(false);
    }
  }, [userId, weekStart, weekDates]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchData(),
          fetchHolidays(),
          fetchLeaves(currentYear)
        ]);
      } catch (err) {
        console.error('Error loading data', err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [fetchData, fetchHolidays, fetchLeaves, currentYear]);

  // 🔹 Row operations
  const addRow = () => {
    if (isLocked) return;
    const id = 'r' + Date.now();
    const hours = Object.fromEntries(weekDates.map(d => [d.format('YYYY-MM-DD'), 0]));
    setRows(prev => [...prev, { id, taskName: '', hours }]);
  };

  const deleteRow = (index: number) => {
    if (isLocked) { pushMessage('info','Timesheet is locked'); return; }
    setConfirmDelete({ open: true, rowIndex: index });
  };

  const handleChange = (rowIndex: number, date: string, value: number) => {
    if (isLocked) return;
    setRows(prev => {
      const copy = [...prev];
      copy[rowIndex].hours[date] = Number(value);
      copy[rowIndex]._dirty = true;
      return copy;
    });
  };

  const handleTaskNameChange = (rowIndex: number, name: string) => {
    if (isLocked) return;
    setRows(prev => {
      const copy = [...prev];
      copy[rowIndex].taskName = name;
      copy[rowIndex]._dirty = true;
      return copy;
    });
  };

  // 🔹 Total hours per day
  const dayTotals = useMemo(() => {
    const keys = weekDates.map(d => d.format('YYYY-MM-DD'));
    return keys.map(k =>
      rows.reduce((sum, r) => sum + (r.hours[k] ? Number(r.hours[k]) : 0), 0)
    );
  }, [rows, weekDates]);

  // 🔹 Save logic (update existing or create new)
  const saveAll = async () => {
    try {
      setLoading(true);

      const toCreate: TimeSheetModel[] = [];
      const toUpdate: Record<string, TimeSheetModel> = {}; // Key by timesheetId to avoid duplicates

      rows.forEach(r => {
        Object.entries(r.hours).forEach(([date, hours]) => {
          const tsId = r.timesheetIds?.[date];
          if (hours > 0 && r.taskName) {
            const base: TimeSheetModel = {
              workDate: date,
              hoursWorked: hours,
              taskName: r.taskName,
              taskDescription: '',
              ...(tsId && { timesheetId: tsId }),
            };

            if (!tsId) {
              toCreate.push(base);
            } else if (r._dirty) {
              toUpdate[tsId] = base;
            }
          }
        });
      });

      // 🟢 Create new
      if (toCreate.length > 0) {
        const response = await timesheetService.createTimesheets(toCreate);
        if (!response.flag) {
          throw new Error(response.message || 'Failed to create timesheets');
        }
        // Assume response.response is array of { timesheetId, workDate, ... }
        const created = response.response as { timesheetId: string; workDate: string; taskName: string }[];
        if (created && Array.isArray(created)) {
          created.forEach((item) => {
            // only map back created items that have a timesheetId and workDate
            if (!item.timesheetId || !item.workDate) return;
            const dateKey = item.workDate;
            const tsId = item.timesheetId;
            setRows(prev => prev.map((r: TaskRow) => {
              if (r.taskName === item.taskName) {
                return { ...r, timesheetIds: { ...(r.timesheetIds || {}), [dateKey]: tsId } };
              }
              return r;
            }));
          });
        }
      }

      // 🟢 Update existing
      for (const [tsId, upd] of Object.entries(toUpdate)) {
        try {
          const updateResponse = await timesheetService.updateTimesheet(tsId, upd);
          if (!updateResponse.flag) {
            console.error('Update failed for', upd, updateResponse.message);
          }
        } catch (err) {
          console.error('Update failed for', upd, err);
        }
      }

      await fetchData();
      pushMessage('success','Save successful');
    } catch (err) {
      console.error(err);
      pushMessage('error','Save failed');
    } finally {
      setLoading(false);
    }
  };

  // Validation logic (weekend exempt, skip leave/holiday)
  const runValidation = (): { ok: boolean; messages: string[] } => {
    const msgs: string[] = [];
    rows.forEach((r, ri) => {
      const anyHours = Object.values(r.hours).some(h => Number(h) > 0);
      if (anyHours && (!r.taskName || r.taskName.trim() === '')) msgs.push(`Row ${ri+1}: task name required when hours present`);
      Object.entries(r.hours).forEach(([d, h]) => {
        if (h < 0 || h > 24) msgs.push(`${d}: invalid hours in row ${ri+1}`);
        if (holidayMap[d] && h > 0) msgs.push(`${d}: entries present on holiday ${holidayMap[d].holidayName}`);
        const weekday = dayjs(d).day();
        const isWeekend = weekday === 0 || weekday === 6;
        if (isWeekend && h > 0) msgs.push(`${d}: entries present on weekend`);
      });
    });

    const keys = weekDates.map(d => d.format('YYYY-MM-DD'));
    keys.forEach(k => {
      const total = rows.reduce((s, r) => s + (Number(r.hours[k] || 0)), 0);
      const weekday = dayjs(k).day(); // 0 Sun, 6 Sat
      const isWeekend = weekday === 0 || weekday === 6;
      if (!holidayMap[k] && !leaveMap[k] && !isWeekend && total === 0) msgs.push(`${k}: total hours are 0`);
    });

    return { ok: msgs.length === 0, messages: msgs };
  };

  // 🔹 Submit for approval (opens confirmation)
  const submitForApproval = async () => {
    if (isLocked) { pushMessage('info','Already submitted'); return; }
    setConfirmSubmitOpen(true);
  };

  const confirmSubmitYes = async () => {
    setConfirmSubmitOpen(false);
    const validation = runValidation();
    if (!validation.ok) {
      validation.messages.forEach(m => pushMessage('error', m));
      return;
    }

    try {
      setLoading(true);
      await saveAll(); // ensures entries persisted and fetchData refreshed

      // Collect relevant timesheet IDs from local state (post-save)
      const ids: string[] = [];
      rows.forEach(r => {
        Object.entries(r.timesheetIds || {}).forEach(([date, id]) => {
          if (id && r.hours[date] > 0) {
            ids.push(id);
          }
        });
      });

      if (ids.length === 0) {
        pushMessage('info', 'No timesheet entries to submit');
        return;
      }

      // Submit all timesheets for approval
      const submitResponse = await timesheetService.submitForApproval(ids);
      if (!submitResponse.flag) {
        throw new Error(submitResponse.message || 'Failed to submit for approval');
      }

      setIsLocked(true);
      pushMessage('success', 'Submitted for approval');
      await fetchData();
    } catch (err) {
      console.error('submit failed', err);
      pushMessage('error', 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmSubmitNo = () => setConfirmSubmitOpen(false);

  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="text-lg">Loading...</div></div>;
  }

  const isHolidayOrLeave = (date: string) => !!holidayMap[date] || !!leaveMap[date];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Calendar/Date Picker Section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Week</h2>
          <div className="flex items-center space-x-2">
            <ChevronLeft 
              className="cursor-pointer text-gray-600 hover:text-gray-800" 
              size={24} 
              onClick={() => setWeekStart(prev => prev.subtract(1, 'week'))}
            />
            <ChevronRight 
              className="cursor-pointer text-gray-600 hover:text-gray-800" 
              size={24} 
              onClick={() => setWeekStart(prev => prev.add(1, 'week'))}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-600">
            Week: {weekStart.format('MMM D')} - {weekStart.clone().add(6, 'day').format('MMM D, YYYY')} 
          </div>
        </div>
      </div>

      {/* Messages Panel */}
      <div className="mb-4 space-y-2">
        {messages.map(m => (
          <div key={m.id} className={`p-3 rounded-lg shadow-sm ${
            m.type === 'success' ? 'bg-green-50 border-l-4 border-green-400 text-green-800' :
            m.type === 'error' ? 'bg-red-50 border-l-4 border-red-400 text-red-800' :
            'bg-blue-50 border-l-4 border-blue-400 text-blue-800'
          }`}>
            {m.text}
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Task
                  <button onClick={addRow} disabled={isLocked} className="ml-2 p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50">
                    <Plus size={14} />
                  </button>
                </th>
                {weekDates.map(d => {
                  const key = d.format('YYYY-MM-DD');
                  const isHoliday = holidayMap[key];
                  const isLeave = leaveMap[key];
                  const weekday = d.day();
                  const isWeekend = weekday === 0 || weekday === 6;
                  let statusText = '';
                  let statusClass = '';
                  if (isHoliday) {
                    statusText = isHoliday.holidayName;
                    statusClass = 'text-amber-600 bg-amber-50';
                  } else if (isLeave) {
                    statusText = isLeave;
                    statusClass = 'text-blue-600 bg-blue-50';
                  } else if (isWeekend) {
                    statusText = 'Weekend';
                    statusClass = 'text-gray-600 bg-gray-100';
                  }
                  return (
                    <th key={key} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      <div className="font-semibold text-gray-900">{d.format('DD ddd')}</div>
                      {statusText && (
                        <div className={`mt-1 px-2 py-1 rounded-full text-xs ${statusClass}`}>
                          {statusText}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, rowIndex) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => deleteRow(rowIndex)} 
                        disabled={isLocked || deletingRowIndex !== null}
                        className="p-1 rounded-full text-red-500 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        value={row.taskName}
                        placeholder="Task name"
                        onChange={e => handleTaskNameChange(rowIndex, e.target.value)}
                        disabled={isLocked}
                      />
                    </div>
                  </td>
                  {weekDates.map(d => {
                    const key = d.format('YYYY-MM-DD');
                    const isHoliday = holidayMap[key];
                    const isLeave = leaveMap[key];
                    const weekday = d.day();
                    const isWeekend = weekday === 0 || weekday === 6;
                    const disabled = isLocked || !!isHoliday || !!isLeave || isWeekend;
                    return (
                      <td key={key} className="px-3 py-4 whitespace-nowrap text-center border-r border-gray-200">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          className="w-16 px-2 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          value={row.hours[key] ?? 0}
                          disabled={disabled}
                          onChange={e =>
                            handleChange(rowIndex, key, Number(e.target.value))
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900 border-r border-gray-200">
                  Total Hours
                </td>
                {dayTotals.map((t, i) => (
                  <td key={i} className="px-3 py-3 text-center text-sm font-semibold text-gray-900 border-r border-gray-200">
                    {t.toFixed(1)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Fixed Bottom Right Buttons */}
      <div className="fixed bottom-6 right-6 space-x-3 z-40">
        <button
          onClick={saveAll}
          disabled={loading || isLocked}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
        <button
          onClick={submitForApproval}
          disabled={loading || isLocked}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit for Approval
        </button>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete.open && confirmDelete.rowIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Trash2 className="text-red-500 mr-2" size={20} />
              Confirm Delete
            </div>
            <div className="text-gray-600 mb-6">Are you sure you want to delete this row? This will remove all associated timesheet entries from the server.</div>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors" 
                onClick={() => setConfirmDelete({ open: false, rowIndex: null })}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50" 
                disabled={deletingRowIndex !== null}
                onClick={async () => {
                  const idx = confirmDelete.rowIndex!;
                  const row = rows[idx];
                  if (!row) { setConfirmDelete({ open: false, rowIndex: null }); return; }
                  setDeletingRowIndex(idx); // Show loading
                  try {
                    // Optimistic local delete first
                    setRows(prev => prev.filter((_, i) => i !== idx));
                    
                    const ids = Object.values(row.timesheetIds || {}).filter(Boolean) as string[];
                    let hadBackendData = false;
                    for (const id of ids) {
                      const deleteResponse = await timesheetService.deleteTimesheet(id);
                      if (!deleteResponse.flag) {
                        console.error('Delete failed for', id, deleteResponse.message);
                      } else {
                        hadBackendData = true;
                      }
                    }
                    
                    if (hadBackendData) {
                      // Only refetch if we deleted backend data (preserves unsaved rows)
                      await fetchData();
                    }
                    
                    const message = ids.length > 0 ? 'Row and entries deleted successfully' : 'Unsaved row deleted';
                    pushMessage('success', message);
                  } catch (err) {
                    console.error('delete failed', err);
                    // Rollback optimistic delete on error
                    setRows(prev => [...prev, row]);
                    pushMessage('error','Delete failed - changes rolled back');
                  } finally {
                    setDeletingRowIndex(null);
                    setConfirmDelete({ open: false, rowIndex: null });
                  }
                }}
              >
                {deletingRowIndex !== null ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submit Modal */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-xl font-semibold text-gray-900 mb-4">Submit for Approval</div>
            <div className="text-gray-600 mb-6">Are you sure you want to submit this timesheet for manager approval? This action cannot be undone until approved or rejected.</div>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors" 
                onClick={confirmSubmitNo}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors" 
                onClick={confirmSubmitYes}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSheetRegister;