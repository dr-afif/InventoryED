import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { History, Plus, Minus, CheckCircle, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';

export const Logs = () => {
  const { auditLogs, medications, users } = useStore();

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white px-4 md:px-8 py-6 border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Audit Logs</h2>
        <p className="text-slate-500 text-sm">History of all inventory movements and checks.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {auditLogs.length === 0 ? (
            <div className="card p-12 text-center text-slate-500">
              <History size={48} className="mx-auto mb-4 text-slate-300" />
              <p>No activity recorded yet.</p>
            </div>
          ) : (
            auditLogs.map(log => {
              const med = medications.find(m => m.id === log.medicationId);
              const user = users.find(u => u.id === log.userId);

              let Icon = History;
              let iconColor = "text-slate-500";
              let bgColor = "bg-slate-100";

              if (log.action === 'check') {
                Icon = CheckCircle;
                iconColor = "text-primary-600";
                bgColor = "bg-primary-50";
              } else if (log.quantityChange > 0) {
                Icon = Plus;
                iconColor = "text-success";
                bgColor = "bg-success/10";
              } else if (log.quantityChange < 0) {
                Icon = Minus;
                iconColor = "text-danger";
                bgColor = "bg-danger/10";
              } else if (log.action === 'transfer') {
                Icon = RefreshCcw;
                iconColor = "text-warning";
                bgColor = "bg-warning/10";
              }

              return (
                <div key={log.id} className="card p-4 flex gap-4 items-start">
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1", bgColor, iconColor)}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-slate-800">
                        {user?.name} <span className="font-normal text-slate-500">performed {log.action}</span>
                      </p>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-700 font-medium">
                      {med?.name}
                    </p>
                    
                    {log.quantityChange !== 0 && (
                      <p className="text-xs font-bold mt-2">
                        <span className={log.quantityChange > 0 ? 'text-success' : 'text-danger'}>
                          {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                        </span>
                        <span className="text-slate-500 font-normal ml-1">units adjusted</span>
                      </p>
                    )}
                    
                    {log.reason && (
                      <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                        "{log.reason}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>
    </div>
  );
};
