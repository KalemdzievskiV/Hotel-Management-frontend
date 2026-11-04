import { SubscriptionEvent } from '@/types';
import { MobileList, MobileListItem } from '@/components/ui/mobile-list';
import { eventLabel, formatDate, formatMoney } from './planDisplay';

/**
 * A subscription's history: every trial, payment and change, with who made it and why
 */
export default function HistoryTable({ history }: { history: SubscriptionEvent[] }) {
  const details = (event: SubscriptionEvent) =>
    [event.reason, event.reference && `ref. ${event.reference}`, event.actorName && `by ${event.actorName}`]
      .filter(Boolean)
      .join(' · ');

  return (
    <>
    <MobileList>
      {history.map((event, i) => (
        <MobileListItem
          key={i}
          title={eventLabel(event)}
          aside={event.amount ? <span className="text-sm font-medium text-gray-900">{formatMoney(event.amount)}</span> : undefined}
        >
          <p>
            {formatDate(event.createdAt)} · {event.plan}
            {event.newAccessUntil && <> · until {formatDate(event.newAccessUntil)}</>}
          </p>
          {details(event) && <p className="[overflow-wrap:anywhere]">{details(event)}</p>}
        </MobileListItem>
      ))}
    </MobileList>
    <table className="hidden md:table w-full text-left text-sm">
      <thead className="border-b bg-gray-50 text-gray-600">
        <tr>
          <th className="px-4 py-3 font-medium">Date</th>
          <th className="px-4 py-3 font-medium">What happened</th>
          <th className="px-4 py-3 font-medium">Plan</th>
          <th className="px-4 py-3 font-medium">Until</th>
          <th className="px-4 py-3 text-right font-medium">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {history.map((event, i) => (
          <tr key={i}>
            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(event.createdAt)}</td>
            <td className="px-4 py-3">
              <span className="font-medium text-gray-900">{eventLabel(event)}</span>
              {(event.reason || event.actorName || event.reference) && (
                <span className="block text-gray-500 [overflow-wrap:anywhere]">
                  {details(event)}
                </span>
              )}
            </td>
            <td className="px-4 py-3 text-gray-700">{event.plan}</td>
            <td className="whitespace-nowrap px-4 py-3 text-gray-700">{formatDate(event.newAccessUntil)}</td>
            <td className="px-4 py-3 text-right text-gray-900">{event.amount ? formatMoney(event.amount) : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </>
  );
}
