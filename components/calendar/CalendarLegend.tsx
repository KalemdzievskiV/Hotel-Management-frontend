import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STATUS_STYLES } from './calendarUtils';

export default function CalendarLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Legend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Status</p>
            <div className="flex flex-wrap gap-4">
              {Object.values(STATUS_STYLES).map(style => (
                <div key={style.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border ${style.className}`} />
                  <span className="text-sm">{style.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">Booking Type</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Short-Stay (Hourly)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300" />
                <span className="text-sm">Overnight Stay</span>
              </div>
            </div>
          </div>
          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">Tips</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Click on a date to quickly create a new reservation</li>
              <li>• Click on a reservation to view details</li>
              <li>• Hover over dates to see the + icon for quick creation</li>
              <li>• Short-stay bookings show time ranges (e.g., 10:00 AM - 2:00 PM)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
