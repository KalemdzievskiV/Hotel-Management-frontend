import { Room, BookingType, RoomType, RoomTypeLabels } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  Building2,
  Sparkles
} from 'lucide-react';

interface RoomCardProps {
  room: Room;
  bookingType: BookingType;
  nights?: number;
  hours?: number;
  onSelect?: (room: Room) => void;
  selected?: boolean;
  compact?: boolean; // Compact mode for dialogs
}

export function RoomCard({ 
  room, 
  bookingType, 
  nights = 1,
  hours = 1,
  onSelect, 
  selected = false,
  compact = false
}: RoomCardProps) {
  const totalPrice = bookingType === BookingType.ShortStay 
    ? (room.shortStayHourlyRate || 0) * hours
    : room.pricePerNight * nights;

  const getRoomTypeBadgeColor = (type: RoomType) => {
    const colors: Record<RoomType, string> = {
      [RoomType.Single]: 'bg-gray-100 text-gray-800 border-gray-300',
      [RoomType.Double]: 'bg-blue-100 text-blue-800 border-blue-300',
      [RoomType.Twin]: 'bg-sky-100 text-sky-800 border-sky-300',
      [RoomType.Triple]: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      [RoomType.Suite]: 'bg-purple-100 text-purple-800 border-purple-300',
      [RoomType.Deluxe]: 'bg-amber-100 text-amber-800 border-amber-300',
      [RoomType.Presidential]: 'bg-rose-100 text-rose-800 border-rose-300',
      [RoomType.Studio]: 'bg-teal-100 text-teal-800 border-teal-300',
      [RoomType.Family]: 'bg-green-100 text-green-800 border-green-300',
      [RoomType.Accessible]: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Compact mode for dialogs
  if (compact) {
    return (
      <Card 
        className={`overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${
          selected ? 'ring-2 ring-blue-500 shadow-md bg-blue-50' : ''
        }`}
        onClick={() => onSelect?.(room)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Room Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">Room {room.roomNumber}</span>
                <Badge className={`${getRoomTypeBadgeColor(room.type)} text-xs px-2 py-0`}>
                  {RoomTypeLabels[room.type]}
                </Badge>
                {selected && (
                  <CheckCircle2 className="h-4 w-4 text-blue-600 ml-auto" />
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {room.capacity}
                </span>
                {room.amenities && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {room.amenities.split(',').length}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Price & Select */}
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">
                {bookingType === BookingType.ShortStay
                  ? `$${room.shortStayHourlyRate}/hr × ${hours}`
                  : `$${room.pricePerNight}/nt × ${nights}`}
              </div>
              <div className="font-bold text-green-600">
                ${totalPrice.toFixed(2)}
              </div>
              <Button 
                size="sm"
                variant={selected ? "default" : "outline"}
                className="mt-1 h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(room);
                }}
              >
                {selected ? 'Selected' : 'Select'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full mode for standalone pages
  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${
        selected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={() => onSelect?.(room)}
    >
      <CardContent className="p-0">
        {/* Room Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="h-20 w-20 text-blue-300" />
          </div>
          
          {/* Room Number Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-gray-900 border-0 text-lg font-bold px-3 py-1">
              Room {room.roomNumber}
            </Badge>
          </div>

          {/* Selected Badge */}
          {selected && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-600 text-white border-0">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Selected
              </Badge>
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="p-4 space-y-4">
          {/* Room Type & Amenities */}
          <div className="flex items-center justify-between">
            <Badge className={getRoomTypeBadgeColor(room.type)}>
              {RoomTypeLabels[room.type]}
            </Badge>
            {room.amenities && (
              <div className="flex items-center text-xs text-gray-500">
                <Sparkles className="h-3 w-3 mr-1" />
                {room.amenities.split(',').length} amenities
              </div>
            )}
          </div>

          {/* Capacity */}
          <div className="flex items-center text-gray-700">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-sm">
              Up to {room.capacity} guest{room.capacity > 1 ? 's' : ''}
            </span>
          </div>

          {/* Description (if available) */}
          {room.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Amenities List (if available) */}
          {room.amenities && (
            <div className="flex flex-wrap gap-1">
              {room.amenities.split(',').slice(0, 4).map((amenity, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {amenity.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t pt-4">
            {/* Pricing */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-gray-600">
                {bookingType === BookingType.ShortStay ? (
                  <>
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      ${room.shortStayHourlyRate}/hour × {hours}h
                    </span>
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      ${room.pricePerNight}/night × {nights}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Total Price */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Total Price</div>
                <div className="text-2xl font-bold text-green-600">
                  ${totalPrice.toFixed(2)}
                </div>
              </div>
              
              <Button 
                size="sm"
                className={selected ? 'bg-blue-600 hover:bg-blue-700' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(room);
                }}
              >
                {selected ? 'Selected' : 'Select Room'}
              </Button>
            </div>
          </div>

          {/* Short Stay Info */}
          {bookingType === BookingType.ShortStay && room.allowsShortStay && (
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {room.minimumShortStayHours && `Min: ${room.minimumShortStayHours}h`}
                  {room.minimumShortStayHours && room.maximumShortStayHours && ' • '}
                  {room.maximumShortStayHours && `Max: ${room.maximumShortStayHours}h`}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
