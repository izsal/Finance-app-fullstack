"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowDownRightIcon,
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BellIcon,
  Building2Icon,
  CalendarDaysIcon,
  CalendarIcon,
  CameraIcon,
  ChartColumnIcon,
  ChartPieIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  ClockIcon,
  CodeIcon,
  CoinsIcon,
  CreditCardIcon,
  CrownIcon,
  DownloadIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FileSpreadsheetIcon,
  FilterIcon,
  GlobeIcon,
  KeyRoundIcon,
  LanguagesIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LoaderCircleIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  MapPinIcon,
  MedalIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PhoneIcon,
  PiggyBankIcon,
  PlusIcon,
  QuoteIcon,
  ReceiptIcon,
  RefreshCwIcon,
  RepeatIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  SmartphoneIcon,
  SparklesIcon,
  SquarePenIcon,
  StarIcon,
  SunIcon,
  TagIcon,
  TargetIcon,
  TerminalIcon,
  Trash2Icon,
  TrendingDownIcon,
  TrendingUpIcon,
  UserIcon,
  UsersIcon,
  WalletCardsIcon,
  WalletIcon,
  XIcon,
  ZapIcon,
} from "@animateicons/react/lucide";

/**
 * Higher-order component wrapping animateicons.in Lucide icons
 * ensuring responsive scaling via Tailwind classes (`h-*`, `w-*`) and interactive motion.
 */
function createAnimatedIcon(IconComponent: React.ComponentType<any>) {
  const Component = forwardRef<any, any>(function AnimatedIcon(
    { className, size, isAnimated = true, ...props },
    ref
  ) {
    return (
      <IconComponent
        ref={ref}
        size={size}
        isAnimated={isAnimated}
        className={cn("[&>svg]:w-full [&>svg]:h-full shrink-0", className)}
        {...props}
      />
    );
  });
  return Component;
}

export const AlertCircle = createAnimatedIcon(CircleAlertIcon);
export const ArrowDownRight = createAnimatedIcon(ArrowDownRightIcon);
export const ArrowLeftRight = createAnimatedIcon(ArrowLeftRightIcon);
export const ArrowRight = createAnimatedIcon(ArrowRightIcon);
export const ArrowUpRight = createAnimatedIcon(ArrowUpRightIcon);
export const Award = createAnimatedIcon(MedalIcon);
export const BarChart3 = createAnimatedIcon(ChartColumnIcon);
export const Bell = createAnimatedIcon(BellIcon);
export const Building2 = createAnimatedIcon(Building2Icon);
export const Calendar = createAnimatedIcon(CalendarIcon);
export const CalendarDays = createAnimatedIcon(CalendarDaysIcon);
export const Camera = createAnimatedIcon(CameraIcon);
export const Check = createAnimatedIcon(CheckIcon);
export const CheckCircle2 = createAnimatedIcon(CircleCheckIcon);
export const ChevronDown = createAnimatedIcon(ChevronDownIcon);
export const ChevronLeft = createAnimatedIcon(ChevronLeftIcon);
export const ChevronRight = createAnimatedIcon(ChevronRightIcon);
export const Clock = createAnimatedIcon(ClockIcon);
export const Code2 = createAnimatedIcon(CodeIcon);
export const Coins = createAnimatedIcon(CoinsIcon);
export const CreditCard = createAnimatedIcon(CreditCardIcon);
export const Crown = createAnimatedIcon(CrownIcon);
export const Download = createAnimatedIcon(DownloadIcon);
export const Edit3 = createAnimatedIcon(SquarePenIcon);
export const ExternalLink = createAnimatedIcon(ExternalLinkIcon);
export const Eye = createAnimatedIcon(EyeIcon);
export const EyeOff = createAnimatedIcon(EyeOffIcon);
export const FileSpreadsheet = createAnimatedIcon(FileSpreadsheetIcon);
export const Filter = createAnimatedIcon(FilterIcon);
export const Globe = createAnimatedIcon(GlobeIcon);
export const KeyRound = createAnimatedIcon(KeyRoundIcon);
export const Languages = createAnimatedIcon(LanguagesIcon);
export const Layers = createAnimatedIcon(LayersIcon);
export const LayoutDashboard = createAnimatedIcon(LayoutDashboardIcon);
export const Loader2 = createAnimatedIcon(LoaderCircleIcon);
export const Lock = createAnimatedIcon(LockIcon);
export const LogOut = createAnimatedIcon(LogOutIcon);
export const Mail = createAnimatedIcon(MailIcon);
export const MapPin = createAnimatedIcon(MapPinIcon);
export const Menu = createAnimatedIcon(MenuIcon);
export const Moon = createAnimatedIcon(MoonIcon);
export const PanelLeftClose = createAnimatedIcon(PanelLeftCloseIcon);
export const PanelLeftOpen = createAnimatedIcon(PanelLeftOpenIcon);
export const Phone = createAnimatedIcon(PhoneIcon);
export const PieChart = createAnimatedIcon(ChartPieIcon);
export const PiggyBank = createAnimatedIcon(PiggyBankIcon);
export const Plus = createAnimatedIcon(PlusIcon);
export const Quote = createAnimatedIcon(QuoteIcon);
export const Receipt = createAnimatedIcon(ReceiptIcon);
export const RefreshCw = createAnimatedIcon(RefreshCwIcon);
export const Repeat = createAnimatedIcon(RepeatIcon);
export const RotateCcw = createAnimatedIcon(RotateCcwIcon);
export const Search = createAnimatedIcon(SearchIcon);
export const Settings2 = createAnimatedIcon(SlidersHorizontalIcon);
export const Shield = createAnimatedIcon(ShieldIcon);
export const ShieldCheck = createAnimatedIcon(ShieldCheckIcon);
export const Smartphone = createAnimatedIcon(SmartphoneIcon);
export const Sparkles = createAnimatedIcon(SparklesIcon);
export const Star = createAnimatedIcon(StarIcon);
export const Sun = createAnimatedIcon(SunIcon);
export const Tag = createAnimatedIcon(TagIcon);
export const Target = createAnimatedIcon(TargetIcon);
export const Terminal = createAnimatedIcon(TerminalIcon);
export const Trash2 = createAnimatedIcon(Trash2Icon);
export const TrendingDown = createAnimatedIcon(TrendingDownIcon);
export const TrendingUp = createAnimatedIcon(TrendingUpIcon);
export const User = createAnimatedIcon(UserIcon);
export const Users = createAnimatedIcon(UsersIcon);
export const Wallet = createAnimatedIcon(WalletIcon);
export const WalletCards = createAnimatedIcon(WalletCardsIcon);
export const X = createAnimatedIcon(XIcon);
export const Zap = createAnimatedIcon(ZapIcon);
