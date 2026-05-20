# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete Supabase integration for mobile and web apps
- Real-time booking management for partners
- Vehicle management for clients
- Partner dashboard with KPI cards and booking table
- Services CRUD on partner dashboard
- Settings page with location and working hours management
- RLS policies for all database tables
- Row-level security for vehicles and client profiles (booking joins)

## [0.1.0] — 2025-05-19

### Added
- Initial monorepo setup with pnpm workspaces and Turborepo
- Expo SDK 51 mobile app with Expo Router v3 and NativeWind
- Next.js 14 partner dashboard with App Router
- Supabase schema: users, client_profiles, partner_profiles, partner_locations, services, vehicles, bookings, payments, partner_balances, withdrawals, notifications
- Authentication flows (register + login) for client and partner roles
- PostGIS geolocation support for partner proximity search
- Database migrations (001–005)
- Shared types and constants package (`@lavo/shared`)
- Database client package (`@lavo/database`)
