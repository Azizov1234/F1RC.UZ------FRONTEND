/**
 * useQueryKeys — Centralized React Query key factory.
 * Barcha query keylar shu yerda. Har bir yangi resource uchun key qo'shilsin.
 */

export const queryKeys = {
  // Auth
  auth: {
    user: () => ['auth', 'user'] as const,
    publicSettings: () => ['auth', 'publicSettings'] as const,
  },

  // Users
  users: {
    all: () => ['users'] as const,
    lists: () => [...queryKeys.users.all(), 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all(), 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.users.details(), id] as const,
  },

  // Profiles
  profiles: {
    all: () => ['profiles'] as const,
    my: () => [...queryKeys.profiles.all(), 'my'] as const,
    detail: (userId: string | number) => [...queryKeys.profiles.all(), 'detail', userId] as const,
  },

  // Categories
  categories: {
    all: () => ['categories'] as const,
    lists: () => [...queryKeys.categories.all(), 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.categories.lists(), params] as const,
    detail: (id: string | number) => [...queryKeys.categories.all(), 'detail', id] as const,
    publicDetail: (id: string | number) => [...queryKeys.categories.all(), 'public', 'detail', id] as const,
    adminDetail: (id: string | number) => [...queryKeys.categories.all(), 'admin', 'detail', id] as const,
  },

  // Vehicles
  vehicles: {
    all: () => ['vehicles'] as const,
    lists: () => [...queryKeys.vehicles.all(), 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.vehicles.lists(), params] as const,
    detail: (id: string | number) => [...queryKeys.vehicles.all(), 'detail', id] as const,
    publicDetail: (id: string | number) => [...queryKeys.vehicles.all(), 'public', 'detail', id] as const,
    adminDetail: (id: string | number) => [...queryKeys.vehicles.all(), 'admin', 'detail', id] as const,
  },

  // Vehicle Maintenances
  maintenances: {
    all: () => ['maintenances'] as const,
    lists: () => [...queryKeys.maintenances.all(), 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.maintenances.lists(), params] as const,
    detail: (id: string | number) => [...queryKeys.maintenances.all(), 'detail', id] as const,
  },

  // Arenas
  arenas: {
    all: () => ['arenas'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.arenas.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.arenas.all(), 'detail', id] as const,
    publicDetail: (id: string | number) => [...queryKeys.arenas.all(), 'public', 'detail', id] as const,
    adminDetail: (id: string | number) => [...queryKeys.arenas.all(), 'admin', 'detail', id] as const,
  },

  // Track Layouts
  trackLayouts: {
    all: () => ['track-layouts'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.trackLayouts.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.trackLayouts.all(), 'detail', id] as const,
    publicDetail: (id: string | number) => [...queryKeys.trackLayouts.all(), 'public', 'detail', id] as const,
    adminDetail: (id: string | number) => [...queryKeys.trackLayouts.all(), 'admin', 'detail', id] as const,
  },

  // Arena Zones
  arenaZones: {
    all: () => ['arena-zones'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.arenaZones.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.arenaZones.all(), 'detail', id] as const,
  },

  // Seasons
  seasons: {
    all: () => ['seasons'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.seasons.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.seasons.all(), 'detail', id] as const,
  },

  // Events
  events: {
    all: () => ['events'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.events.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.events.all(), 'detail', id] as const,
  },

  // Schedule Slots
  scheduleSlots: {
    all: () => ['schedule-slots'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.scheduleSlots.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.scheduleSlots.all(), 'detail', id] as const,
  },

  // Bookings
  bookings: {
    all: () => ['bookings'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.bookings.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.bookings.all(), 'detail', id] as const,
    mine: (params?: Record<string, unknown>) => [...queryKeys.bookings.all(), 'mine', params] as const,
  },

  // Payments
  payments: {
    all: () => ['payments'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.payments.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.payments.all(), 'detail', id] as const,
    mine: (params?: Record<string, unknown>) => [...queryKeys.payments.all(), 'mine', params] as const,
  },

  // Race Sessions
  raceSessions: {
    all: () => ['race-sessions'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.raceSessions.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.raceSessions.all(), 'detail', id] as const,
  },

  // Race Participants
  raceParticipants: {
    all: () => ['race-participants'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.raceParticipants.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.raceParticipants.all(), 'detail', id] as const,
  },

  // Race Laps
  raceLaps: {
    all: () => ['race-laps'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.raceLaps.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.raceLaps.all(), 'detail', id] as const,
  },

  // Race Results
  raceResults: {
    all: () => ['race-results'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.raceResults.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.raceResults.all(), 'detail', id] as const,
  },

  // Leaderboard
  leaderboard: {
    all: () => ['leaderboard'] as const,
    public: (params: Record<string, unknown>) => [...queryKeys.leaderboard.all(), 'public', params] as const,
    admin: (params?: Record<string, unknown>) => [...queryKeys.leaderboard.all(), 'admin', params] as const,
    detail: (id: string | number) => [...queryKeys.leaderboard.all(), 'detail', id] as const,
  },

  // Teams
  teams: {
    all: () => ['teams'] as const,
    adminList: (params?: Record<string, unknown>) => [...queryKeys.teams.all(), 'admin', 'list', params] as const,
    adminDetail: (id: string | number) => [...queryKeys.teams.all(), 'admin', 'detail', id] as const,
    myList: (params?: Record<string, unknown>) => [...queryKeys.teams.all(), 'my', 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.teams.all(), 'detail', id] as const,
  },

  // Streams
  streams: {
    all: () => ['streams'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.streams.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.streams.all(), 'detail', id] as const,
  },

  // Achievements
  achievements: {
    all: () => ['achievements'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.achievements.all(), 'list', params] as const,
    adminList: (params?: Record<string, unknown>) => [...queryKeys.achievements.all(), 'admin', params] as const,
    detail: (id: string | number) => [...queryKeys.achievements.all(), 'detail', id] as const,
    my: (params?: Record<string, unknown>) => [...queryKeys.achievements.all(), 'my', params] as const,
  },

  // Referrals
  referrals: {
    all: () => ['referrals'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.referrals.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.referrals.all(), 'detail', id] as const,
  },

  // Settings
  settings: {
    all: () => ['settings'] as const,
    public: () => [...queryKeys.settings.all(), 'public'] as const,
    admin: (params?: Record<string, unknown>) => [...queryKeys.settings.all(), 'admin', params] as const,
    detail: (id: string | number) => [...queryKeys.settings.all(), 'detail', id] as const,
  },

  // Audit Logs
  auditLogs: {
    all: () => ['audit-logs'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.auditLogs.all(), 'list', params] as const,
    detail: (id: string | number) => [...queryKeys.auditLogs.all(), 'detail', id] as const,
  },

  // Notifications
  notifications: {
    all: () => ['notifications'] as const,
    mine: (params?: Record<string, unknown>) => [...queryKeys.notifications.all(), 'mine', params] as const,
    admin: (params?: Record<string, unknown>) => [...queryKeys.notifications.all(), 'admin', params] as const,
    detail: (id: string | number) => [...queryKeys.notifications.all(), 'detail', id] as const,
  },

  // Health
  health: {
    status: () => ['health'] as const,
  },
} as const;
