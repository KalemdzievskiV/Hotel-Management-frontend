import { BarChart3, Calendar as CalendarIcon, Clock, Grid, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingType, Hotel, Room } from '@/types';
import { STATUS_STYLES, ViewMode } from './calendarUtils';

export interface CalendarFilters {
  searchTerm: string;
  hotelId: string;
  roomId: string;
  status: string;
  bookingType: string;
}

interface CalendarToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  hotels: Hotel[];
  rooms: Room[];
  onToday: () => void;
}

const VIEW_MODES: { mode: ViewMode; label: string; icon: React.ComponentType<{ className?: string }>; className?: string }[] = [
  { mode: 'month', label: 'Month', icon: Grid },
  { mode: 'week', label: 'Week', icon: List },
  { mode: 'day', label: 'Day', icon: Clock },
  { mode: 'list', label: 'List', icon: List },
  { mode: 'timeline', label: 'Timeline', icon: BarChart3, className: 'hidden sm:flex' },
];

function FilterSelect({ label, value, onChange, allLabel, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function CalendarToolbar({
  viewMode, onViewModeChange, filters, onFiltersChange, hotels, rooms, onToday,
}: CalendarToolbarProps) {
  const update = (changes: Partial<CalendarFilters>) => onFiltersChange({ ...filters, ...changes });

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              {VIEW_MODES.map(({ mode, label, icon: Icon, className = '' }) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onViewModeChange(mode)}
                  className={`flex-1 sm:flex-none ${className}`}
                >
                  <Icon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by guest, room, hotel..."
                value={filters.searchTerm}
                onChange={(e) => update({ searchTerm: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <FilterSelect
            label="Hotel"
            value={filters.hotelId}
            // Room choices depend on the hotel, so a hotel change resets the room filter
            onChange={(hotelId) => update({ hotelId, roomId: 'all' })}
            allLabel="All Hotels"
            options={hotels.map(hotel => ({ value: hotel.id.toString(), label: hotel.name }))}
          />
          <FilterSelect
            label="Room"
            value={filters.roomId}
            onChange={(roomId) => update({ roomId })}
            allLabel="All Rooms"
            options={rooms.map(room => ({ value: room.id.toString(), label: `Room ${room.roomNumber} - ${room.hotelName}` }))}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(status) => update({ status })}
            allLabel="All Status"
            options={Object.entries(STATUS_STYLES).map(([value, style]) => ({ value, label: style.label }))}
          />
          <FilterSelect
            label="Type"
            value={filters.bookingType}
            onChange={(bookingType) => update({ bookingType })}
            allLabel="All Types"
            options={[
              { value: String(BookingType.Daily), label: 'Daily' },
              { value: String(BookingType.ShortStay), label: 'Short-Stay' },
            ]}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onToday}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
