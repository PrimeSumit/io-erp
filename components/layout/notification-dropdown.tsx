"use client";

import { X } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: any;
  colorClass: string;
  read: boolean;
  link?: string;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkRead: (id: string, link?: string) => void;
  onMarkAllRead: () => void; 
}

export function NotificationDropdown({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: NotificationDropdownProps) {
  
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-40 animate-in fade-in zoom-in-95 duration-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {unreadNotifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No new notifications.
          </div>
        ) : (
          unreadNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => onMarkRead(item.id, item.link)}
              className="flex gap-3 border-b border-gray-50 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.colorClass}`}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {item.message}
                </p>
              </div>
              <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
            </div>
          ))
        )}
      </div>

      {unreadNotifications.length > 0 && (
        <div className="p-2 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button
            onClick={() => {
              onMarkAllRead();
              onClose();
            }}
            className="w-full text-center text-xs font-bold text-gray-500 hover:text-primary py-1.5 transition-colors"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
