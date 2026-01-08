
import React, { useState } from 'react';
import { AppState, ServiceStatus, ServiceRecord } from '../types.ts';

interface Props {
  state: AppState;
  onAddService: () => void;
}

const CalendarView: React.FC<Props> = ({ state, onAddService }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const getServicesForDay = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return state.services.filter(s => s.date === formattedDate);
  };

  const getStatusStyle = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.COMPLETED: return 'bg-emerald-500';
      case ServiceStatus.IN_PROGRESS: return 'bg-amber-500';
      case ServiceStatus.AWAITING_APPROVAL: return 'bg-slate-400';
      default: return 'bg-indigo-500';
    }
  };

  const calendarDays = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-32 border border-slate-100 bg-slate-50/50"></div>);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayServices = getServicesForDay(day);
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

    calendarDays.push(
      <div key={day} className={`h-32 border border-slate-100 p-2 overflow-y-auto hover:bg-indigo-50/30 transition-colors group relative ${isToday ? 'bg-indigo-50/50' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm font-bold ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-400'}`}>
            {day}
          </span>
          {dayServices.length > 0 && (
            <span className="text-[10px] font-black text-indigo-600">{dayServices.length} serv.</span>
          )}
        </div>
        <div className="space-y-1">
          {dayServices.map(s => {
            const customer = state.customers.find(c => c.id === s.customerId);
            return (
              <div key={s.id} className="text-[9px] p-1 rounded border border-transparent bg-white shadow-sm flex items-center gap-1 leading-tight">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusStyle(s.status)}`}></div>
                <span className="truncate font-semibold text-slate-700">{customer?.name || 'Cliente'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Agenda de Serviços</h2>
          <p className="text-slate-500">Visualize e planeje seus próximos trabalhos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">❮</button>
            <div className="px-4 py-2 font-bold text-slate-700 min-w-[140px] text-center">
              {monthNames[month]} {year}
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">❯</button>
          </div>
          <button 
            onClick={onAddService}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <span>➕</span> Agendar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Concluído
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Em Andamento
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div> Aguardando Aprovação
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
