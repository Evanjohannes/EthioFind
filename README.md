# EthioFind

A mobile-first web application designed to help users discover local businesses, search by category, and view detailed information. The platform includes a full business profile system and an admin-approved business onboarding flow.

## Features

### Discovery & Search
- **Home Page:** Users are greeted with a "Discover" page featuring a search bar and horizontal scrolling categories (Restaurants, Cafes, Hotels, etc.).
- **Smart Filtering:** Users can search for anything or apply filters by category, city, sub-city, or proximity.
- **Search History:** A history list of previous searches allows for quick re-searching, with the ability to clear or remove individual entries.
- **Default State:** If no search is active, the page displays top-rated, famous, and nearby businesses that are most frequently searched.
- **New Businesses:** Newly added businesses are highlighted with a "New Business" tag if they are in high demand.

### Business Profiles
- **Details:** Clicking a business card reveals a full profile including a photo gallery (scrollable), address, contact buttons (Call, Email, Telegram, TikTok), and a map view of the location.
- **Branches:** Businesses can list multiple branches, and users can view locations on a map.
- **Rating:** Users can rate a business, though this requires a signed-in account.

### Saved Places
- **Bookmarking:** Users can save businesses to their "Saved" tab.
- **Filtering:** Saved places can be filtered by category, business type, or city. 
- **Smart Display:** The filter only shows categories that the user actually has saved (e.g., if you only saved Cafes and Parks, you won't see Restaurants in the filter list).

### Account & Business Onboarding
- **Authentication:** Sign-up flow includes email OTP verification.
- **Add Business:** Users can register a business by providing name, type, description, address, city, sub-city, and contact links (phone, socials, website).
- **Payment Flow:** Adding a business requires a one-time payment. The admin sets the price and payment methods (Bank Transfer, Telebirr). Users upload a receipt, and the business is posted once the admin approves the payment.
- **Branch Management:** Existing business owners can add branches for free. Adding a new business requires a separate payment.
- **Profile Management:** Business owners can update their information and photos from the account page.

## Tech Stack

This project is built using the following stack:

- **Frontend (Web):** React + Tailwind CSS
- **Mobile (Future):** Expo (React Native)
- **Backend/API:** Supabase SDK + Edge Functions
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Image Storage:** Supabase Storage
- **Maps:** Leaflet / OpenStreetMap


## Getting Started

1. Clone the repository.
2. Install dependencies (`npm install`).
3. Set up your Supabase project and environment variables.
4. Run the development server (`npm start`).



## Author

Built by Evan.