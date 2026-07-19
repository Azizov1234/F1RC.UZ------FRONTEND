/**
 * Shared API response and resource types.
 *
 * Request DTOs live beside their API services. Resource fields and enums here
 * follow the live OpenAPI document served by the NestJS backend.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  field?: string;
}

export interface EntityTimestamps {
  createdAt: string;
  updatedAt: string;
}

export type UserRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'OPERATOR'
  | 'RACER'
  | 'TEAM_MANAGER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'DELETED';

export interface User extends EntityTimestamps {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string | null;
  deletedAt?: string | null;
}

export type ExperienceLevel =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'PRO'
  | 'ELITE';

export interface Profile extends EntityTimestamps {
  id: number;
  userId: number;
  nickname?: string | null;
  bio?: string | null;
  experienceLevel?: ExperienceLevel | null;
  avatarUrl?: string | null;
  user?: User;
}

export interface RacingCategory extends EntityTimestamps {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  speedRange?: string | null;
  trackType?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  MAINTENANCE: 'MAINTENANCE',
  DISABLED: 'DISABLED',
} as const;

export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus];
export type VehicleDifficulty = ExperienceLevel;
export type VehicleControlType =
  | 'RC_CONTROLLER'
  | 'FPV'
  | 'STEERING_WHEEL'
  | 'MOBILE_APP'
  | 'SIMULATOR';

export interface Vehicle extends EntityTimestamps {
  id: number;
  categoryId: number;
  category?: RacingCategory;
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  topSpeedKmh?: number | null;
  batteryLifeMinutes?: number | null;
  controlType?: VehicleControlType | null;
  difficulty?: VehicleDifficulty | null;
  status: VehicleStatus;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export type VehicleMaintenanceStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CANCELLED';

export interface VehicleMaintenance extends EntityTimestamps {
  id: number;
  vehicleId: number;
  vehicle?: Vehicle;
  title: string;
  reason?: string | null;
  notes?: string | null;
  status: VehicleMaintenanceStatus;
  startedAt?: string | null;
  resolvedAt?: string | null;
}

export interface Arena extends EntityTimestamps {
  id: number;
  name: string;
  slug?: string | null;
  address?: string | null;
  city?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  /** Public list projection fields returned instead of nested collections. */
  trackLayoutsCount?: number;
  zonesCount?: number;
  trackLayouts?: TrackLayout[];
  /** Live public arena detail field. */
  zones?: ArenaZone[];
  /** Normalized alias retained for existing consumers. */
  arenaZones?: ArenaZone[];
  /** Optional public detail projection when the backend includes related events. */
  events?: Event[];
}

export type TrackDifficulty = ExperienceLevel;

export interface TrackLayout extends EntityTimestamps {
  id: number;
  arenaId: number;
  arena?: Arena;
  categoryId?: number | null;
  category?: RacingCategory | null;
  name: string;
  slug?: string | null;
  description?: string | null;
  lengthMeters?: number | null;
  difficulty?: TrackDifficulty | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export type ArenaZoneType =
  | 'START_GRID'
  | 'PIT_LANE'
  | 'RALLY_ZONE'
  | 'FINISH_LINE'
  | 'SPECTATOR_ZONE'
  | 'SERVICE_ZONE'
  | 'CONTROL_ROOM'
  | 'OTHER';

export interface ArenaZone extends EntityTimestamps {
  id: number;
  arenaId: number;
  arena?: Arena;
  trackLayoutId?: number | null;
  trackLayout?: TrackLayout | null;
  name: string;
  description?: string | null;
  zoneType: ArenaZoneType;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Season extends EntityTimestamps {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  /** Public season projection count. */
  eventsCount?: number;
}

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Event extends EntityTimestamps {
  id: number;
  seasonId: number;
  season?: Season;
  categoryId: number;
  category?: RacingCategory;
  arenaId: number;
  arena?: Arena;
  trackLayoutId: number;
  trackLayout?: TrackLayout;
  name: string;
  slug?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  status: EventStatus;
  registrationStartsAt: string;
  registrationEndsAt: string;
  startsAt: string;
  endsAt?: string | null;
  price?: number | null;
  currency?: string | null;
  isActive: boolean;
  /** Public detail projection fields. */
  scheduleSlots?: ScheduleSlot[];
  _count?: {
    scheduleSlots: number;
    bookings: number;
  };
}

export type ScheduleSlotStatus = 'OPEN' | 'FULL' | 'CLOSED' | 'CANCELLED';

export interface ScheduleSlot extends EntityTimestamps {
  id: number;
  eventId: number;
  event?: Event;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  status: ScheduleSlotStatus;
  isActive: boolean;
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface Booking extends EntityTimestamps {
  id: number;
  userId: number;
  user?: User;
  eventId: number;
  event?: Event;
  scheduleSlotId: number;
  scheduleSlot?: ScheduleSlot;
  vehicleId?: number | null;
  vehicle?: Vehicle | null;
  status: BookingStatus;
  amount?: number | null;
  qrCode?: string | null;
  notes?: string | null;
  bookedAt?: string | null;
  checkedInAt?: string | null;
}

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'CLICK'
  | 'PAYME'
  | 'UZUM'
  | 'MANUAL';

export type ManualPaymentMethod = Extract<PaymentMethod, 'CASH' | 'CARD' | 'MANUAL'>;

export interface Payment extends EntityTimestamps {
  id: number;
  bookingId: number;
  booking?: Booking;
  userId?: number | null;
  user?: User | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  currency?: string | null;
  provider?: string | null;
  providerTransactionId?: string | null;
  notes?: string | null;
  paidAt?: string | null;
}

export type RaceSessionStatus =
  | 'PENDING'
  | 'ONGOING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RaceSession extends EntityTimestamps {
  id: number;
  eventId: number;
  event?: Event;
  name?: string | null;
  status: RaceSessionStatus;
  scheduledAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  participants?: RaceParticipant[];
  laps?: RaceLap[];
  results?: RaceResult[];
}

export type RaceParticipantStatus =
  | 'REGISTERED'
  | 'CHECKED_IN'
  | 'RACING'
  | 'FINISHED'
  | 'DNF'
  | 'DISQUALIFIED';

export interface RaceParticipant extends EntityTimestamps {
  id: number;
  raceSessionId: number;
  raceSession?: RaceSession;
  userId: number;
  user?: User;
  vehicleId?: number | null;
  vehicle?: Vehicle | null;
  bookingId?: number | null;
  booking?: Booking | null;
  status: RaceParticipantStatus;
  startPosition?: number | null;
  finishPosition?: number | null;
  totalTimeMs?: number | null;
  bestLapTimeMs?: number | null;
}

export interface RaceLap extends EntityTimestamps {
  id: number;
  raceSessionId: number;
  raceSession?: RaceSession;
  participantId: number;
  participant?: RaceParticipant;
  lapNumber: number;
  lapTimeMs: number;
  penaltyMs: number;
  isValid: boolean;
  recordedAt?: string | null;
}

export interface RaceResult extends EntityTimestamps {
  id: number;
  raceSessionId: number;
  raceSession?: RaceSession;
  participantId: number;
  participant?: RaceParticipant;
  userId: number;
  user?: User;
  position?: number | null;
  points: number;
  isWinner?: boolean;
  totalTimeMs?: number | null;
  bestLapMs?: number | null;
}

export interface LeaderboardEntry extends EntityTimestamps {
  id: number;
  seasonId: number;
  season?: Season;
  categoryId: number;
  category?: RacingCategory;
  userId: number;
  user?: User;
  totalPoints: number;
  racesCount: number;
  winsCount: number;
  podiumsCount: number;
  bestLapMs?: number | null;
  rank?: number;
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  user?: User;
  joinedAt?: string | null;
  removedAt?: string | null;
  isActive?: boolean;
}

export interface Team extends EntityTimestamps {
  id: number;
  managerId: number;
  manager?: User;
  name: string;
  slug?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  members?: TeamMember[];
  memberCount?: number;
}

export type StreamStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'DISABLED';

export interface Stream extends EntityTimestamps {
  id: number;
  eventId?: number | null;
  event?: Event | null;
  title: string;
  streamUrl: string;
  status: StreamStatus;
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  isActive: boolean;
}

export type AchievementType =
  | 'FIRST_RACE'
  | 'BEST_LAP'
  | 'WINNER'
  | 'TOP_RANK'
  | 'STREAK'
  | 'CUSTOM';

export interface Achievement extends EntityTimestamps {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  type: AchievementType;
  iconUrl?: string | null;
  criteria?: Record<string, unknown> | null;
  points: number;
  isActive: boolean;
  isUnlocked?: boolean;
  unlockedAt?: string | null;
  awardedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Referral extends EntityTimestamps {
  id: number;
  referrerId: number;
  referrer?: User;
  referredUserId?: number | null;
  referredUser?: User | null;
  code?: string | null;
  status: ReferralStatus;
  completedAt?: string | null;
}

export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'BOOKING'
  | 'PAYMENT'
  | 'RACE'
  | 'SYSTEM';

export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export interface Notification extends EntityTimestamps {
  id: number;
  userId: number;
  user?: User;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  status: NotificationStatus;
}

export type SettingValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
export type SettingValue = string | number | boolean | Record<string, unknown> | unknown[];

export interface Setting extends EntityTimestamps {
  id: number;
  key: string;
  value: SettingValue;
  valueType: SettingValueType;
  description?: string | null;
  isPublic: boolean;
  isActive: boolean;
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'CHECK_IN'
  | 'START'
  | 'FINISH'
  | 'SYSTEM';

export interface AuditLog {
  id: number;
  actorId?: number | null;
  actor?: User | null;
  action: AuditAction;
  entityType?: string | null;
  entityId?: number | string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  database: 'up' | 'down' | string;
  uptime: number;
  timestamp: string;
}
