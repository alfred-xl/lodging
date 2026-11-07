# Stays prototype: assumptions and differences

The app runs at `/`. All of its code is in `resources/js/stays/`, and every token value is in `resources/js/stays/theme.ts`.

## Placeholders

| Placeholder    | Choice                                                                               | To change it             |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------ |
| `{{APP_NAME}}` | Lodgely, a working name                                                              | Set `APP_NAME` in `.env` |
| `{{STACK}}`    | This project's Laravel, React, TypeScript and Tailwind 4 setup, as a mobile web page | Not applicable           |

## Where the prompt and guide disagree

The prompt says to follow the guide when they conflict, unless its "Known differences" table has settled the point.

| Item                | Prompt                             | Used                                            | Why                                                                      |
| ------------------- | ---------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| Heading font        | System font for everything         | Guide's stack, with Avenir Next where installed | The guide wins, and Avenir Next ships with Apple devices                 |
| Thumbs-up on yellow | White icon                         | `onAccent` dark icon                            | The guide says never to put white on `#ffb700`                           |
| Review chip corners | Rounded, with a square bottom left | 6px, added as `radius.chip`                     | The guide gives the value, but the prompt's token list has no 6px radius |
| Room card border    | Soft border                        | `#bcbcbcba`, added as `color.borderRoom`        | The guide measures this exact color                                      |
| Gallery controls    | Swipe and counter                  | Swipe, counter and arrows                       | The guide lists arrows, and they make the gallery usable with a mouse    |

## Where the guide was not followed

| Item                | Guide                                       | Used                                     | Why                                                                                            |
| ------------------- | ------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Phone search button | 64px, 24/32 text, 8 radius (mobile website) | 56px, `emphasized1`, joined to the panel | The prompt bases Home on the App Store images, and the guide records a joined button there too |
| Date cell width     | 40px                                        | An even share of the width               | The prompt asks for this, and 40px would leave gaps on a full-width phone calendar             |
| Active service item | 9999px pill with the icon before the label  | 8px radius with the icon above the label | The prompt's stacked layout is too tall for a pill                                             |

## Details neither document specifies

- **Default search:** no destination, checking in today for one night, as in the Home reference screenshots.
- **Mock data:** 18 fictional properties in each of 6 real cities, with prices in US dollars.
- **Filter counts:** these come from the mock data, so you'll see "9 of 18 properties" rather than the prompt's "1,770 of 2,256".
- **Filter logic:** property types combine with OR, and all other filters combine with AND.
- **Pricing:** the total is the nightly rate × nights × rooms. Adults and children don't change the price.
- **Rates:** every room offers Flexible, Breakfast included (+12%) and Non-refundable (−10%).
- **Guests:** adults can't be fewer than rooms, and children's ages aren't collected.
- **Free cancellation date:** shown as the check-in date, matching the prompt's example.
- **Filters and sort:** filter sheet changes apply on Show results, while quick chips and sort options apply at once.
- **Added controls:** a Clear all button in the filter sheet. The heart in the results header opens the Saved tab.
- **Search summary:** tapping it returns to Home, where the search can be edited.
- **Field validation:** fields are checked on submit and re-checked as they're corrected, not when you leave them. An error appearing on blur moved the submit button out from under the tap.
- **Parts out of scope:** Flights, Cars, Taxi and the menu show a short message instead of doing nothing.
- **Error state:** nothing can really fail with local data, so open `/stays#/results?simulate=error` to see it in development. The first load fails and Try again succeeds.
- **Focus ring:** the guide doesn't capture its shape, so it's a 2px `action` outline with an `actionFocus` glow.
- **The site is the app:** it's served at `/`, and `/stays` redirects there. On wide screens it's a full-height column up to 480px wide, with no phone frame.
- **Scrolling:** scrollbars are hidden throughout, as in a native app. Horizontal rows can be dragged with a mouse as well as swiped, and a drag never counts as a tap.

## Differences from the prompt

- **Photos:** these are original illustrations drawn in code, not photographs. They're placeholders.
- **Native app:** this is a mobile web page, so "pt" is treated as CSS pixels. Safe areas use the browser's `env(safe-area-inset-*)`.
- **Dark mode:** not built, as the prompt asks. Colors are CSS variables set from `theme.ts`, so the guide's dark values can be added there.
- **Larger text:** type sizes are in rem, so they follow the browser's font size setting. iOS Dynamic Type doesn't change web text sizes unless a page opts in, and this one doesn't.

## Bottom navigation

- **Where the bar shows:** the four root screens, plus results and property pages. The request lists root screens as visible and names the hidden flows, but results and property are on neither list. They keep the bar because tab stacks and "tap the active tab to return to root" can't work without it.
- **Account sub-screens:** placeholders, pickers and Notifications hide the bar, since the request only keeps it on the main profile page.
- **Sheets:** the bar stays in the layout but invisible behind sheets, so the screen underneath doesn't shift.
- **Suitcase icon:** Lucide's `Luggage`, from the same set and stroke as the other icons.
- **Tab bar height:** added to `theme.ts` as `layout.tabBarHeight`. The 49pt doesn't include the 1px top border.

## My account

- **First launch:** the app starts signed out, because the sign-in flow needs a real signed-out state. The profile page appears after signing in.
- **Settings:** the Device preferences row opens Settings, as in the reference. It has Language, Currency, Units and Temperature with their current values, then an About section. Its About rows open placeholder pages. "Rate us in the App Store" becomes "Rate us", because this is a web app. The Language hint says text stays in English, instead of the reference's "This will take you to your system settings", which a web page can't do. The version is v 1.0.
- **Currency:** a searchable list with "Suggested for you" and "All currencies", each showing its symbol, with the chosen one ticked. The choice is saved, but prices stay in pounds, and the page says so.
- **Units and Temperature:** imperial units change the distance to the centre in search results to miles. Temperature is saved, but nothing in the app shows weather yet.
- **Saved lists:** opens a Saved page with Lists and Alerts tabs, as in the reference, instead of switching to the Saved tab. Lists shows "My next trip" (the saved properties, which opens the Saved tab) and any lists made with "Create a list". Those lists are names only, kept on this device. Empty, it shows the reference's illustration and "Start your search". Alerts shows the empty price-alerts state and a one-question survey. "Genius" becomes "Lodgely Rewards", and "Start searching for flights" says flights aren't part of the prototype.
- **Preferences:** they're stored with the session, so sign out resets them.
- **Layout:** rebuilt from the reference screenshots. Rows sit in rounded white groups on a light gray page. Signed in, the blue header greets the person by first name, with their photo in a yellow ring. The greeting stays at the top while scrolling.
- **Rewards cards (signed in):** two white cards sit in the blue header. The first says "You have 3 Lodgely rewards" and how many completed stays are left before Level 2 (5 stays, counted from past bookings). The second shows the wallet balance, or "No Credits or vouchers yet". They open the rewards programme page and Rewards & Wallet.
- **Signed out:** a placeholder avatar, "Sign in to manage your trip and save 10% or more on select stays and rental cars", and one Sign in or register button. Below that come the reference's signed-out rows: Rewards programme, Rewards & Wallet, Saved lists, Device and Communication preferences, Help and support with Dispute resolution, and Travel articles. "Genius loyalty programme" becomes "Lodgely Rewards programme".
- **Rewards programme page:** lists the three Level 1 rewards and how the levels work. Signed in, it shows progress towards Level 2. The level rules are made up for the prototype.
- **Tab bar:** a floating, frosted capsule above the bottom edge, as in the iOS 26 reference, with a soft pill behind the active tab. Signed out, the last tab is labelled Sign in. Screens that show the bar end with enough room for it. The property page's Select room panel extends down behind it.
- **Rewards level:** the reference's "Genius Level 1" becomes "Lodgely Rewards Level 1", and "Booking.com" in copy becomes Lodgely.
- **Sections above Preferences:** the screenshots start at Preferences, so two sections come first: Payment information, then Manage account. They hold Rewards & Wallet, Payment methods, Transactions and Personal details.
- **Transaction details:** tapping a payment opens its details: amount, category, property, status, date and time, who processed it, and the card's last 4 digits. Times are shown exactly as recorded, in UK time.
- **Placeholders:** Security settings, Other travellers, Accessibility settings, My reviews, My questions to properties, Safety resource centre, Privacy and data management, and List your property open a placeholder screen.
- **Help Centre (Contact Customer service):** signed in with bookings, it starts with a "Stay safe online" notice that opens, then "Which booking do you need help with?", listing your trips with their status. Each trip opens its stay page. Below that, "Frequently asked questions" has Stays, Flights, Car rentals, Attractions and Airport taxis tabs, then "I can't find my booking". The ten Stays topics open real answers written for the prototype. Topics for the other services say they aren't part of the prototype. "Contact customer service" on a topic page opens Enter booking details.
- **Enter booking details:** Continue finds the booking from its confirmation number, typed with or without "LD-", among the signed-in account's bookings, and opens its stay page. Signed out, it asks you to sign in. Resend confirmation checks the email address but sends nothing. Message Customer Service is a form with your message and email address. Signed-in accounts use their own email, and signed-out visitors type one. Sent messages are saved in the `support_messages` table, limited to 5 a minute, and the confirmation says no one will reply. Call Customer Service opens "Call us anytime" with a tappable number.
- **Customer Service number:** the reference shows Booking.com's real support line, +44 20 3320 2625, which isn't used here, since it would send people to Booking.com. The number comes from `SUPPORT_PHONE` in `.env`. Until that's set, it's +44 20 7946 0123, from the range Ofcom reserves for TV and drama, so it rings no one. Saved lists opens the Saved tab, and Deals opens the discounts page.
- **Where data lives:** database accounts load and save through `/stays/account`, covering the profile, photo upload, saved cards, payments and wallet balance. Mock accounts keep the same details on the device only.
- **Cards:** the full card number never leaves the Add card form. Only the brand, last 4 digits, expiry and cardholder name are sent and stored. The number has to pass a check-digit test, but nothing is charged. In development, the form suggests a test number.
- **Card logos:** Mastercard cards show the Mastercard mark, Visa shows its wordmark, and Amex its blue badge. Other brands show a generic card icon. The network colours are tokens in `theme.ts`.
- **Passport:** the number is stored encrypted and never sent back. The app only ever shows its last 3 digits.
- **Coupons:** no coupon codes exist, so every code is turned down with a message.
- **Email:** the sign-in email is shown but can't be edited, because changing it needs a verification step this prototype doesn't have. The same goes for "Change email with phone verification".
- **Phone flags:** UK numbers show a drawn round Union Jack, as in the reference. Other countries use the flag emoji cropped to a circle, which Windows shows as letters.
- **Rewards & Wallet illustrations:** the wallet, coins, phone and coin-stack pictures are simple drawings in theme colours, standing in for the reference's artwork.
- **Back buttons:** account pages (Personal details, Rewards & Wallet, Payment details, Transactions) use a chevron, as in the reference. Other pages keep the arrow.

## Splash screen

- **Native splash:** this is a web page, so there's no native launch screen to configure. The closest equivalents are in place: a blue page background and a static splash in the first HTML response, a theme color, a light status bar setting and a web app manifest with a blue background.
- **Installed web app:** Android builds its launch screen from the manifest, with the icon as well as the name. iOS needs separate startup images, which aren't included, so an installed iOS app may briefly show a blank screen first. A true native splash needs a native wrapper such as Capacitor.
- **Hard-coded values:** the splash repeats the brand color, font stack and name in the Blade view and manifest, because they must work before `theme.ts` loads. This is the one exception to keeping values in the theme file.
- **Cold start:** any full page load counts, including a browser refresh. A refresh keeps the current screen rather than going to Home, so a mid-flow reload isn't lost.

## Sign-in flow

- **Saving and reserving:** both require sign-in. Afterwards the property is saved, or the flow continues to the review screen.
- **Provider buttons:** these are plain text, with no Google, Apple or Facebook logos, because the icon set doesn't include them.
- **Code entry:** the code submits when the sixth digit is entered. A Verify email button is also there, and shows the loading state.
- **Mock users:** the seeded account is in `resources/js/stays/fixtures/users.ts`. New accounts persist on the device without their password, because people often reuse real ones. A password chosen at sign-up works until the page reloads, and after that the email code still works.
- **Sign out:** this clears the session, including saved properties, bookings and preferences.
- **Keyboards:** type and autofill hints are set and fields scroll into view on focus, but this was tested in desktop Chrome, not with a real on-screen keyboard.
- **Production builds:** the development banner is removed, so nothing shows the mock code. In a production build the seeded user can sign in with a password, but new users can't finish sign-up until a real email service is connected.

## Connecting a real auth provider

| Code                                      | What changes                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `resources/js/stays/auth/mock-auth.ts`    | Replace every function with real API or provider calls, keeping the signatures. `sendVerificationCode` should stop returning the code |
| `resources/js/stays/fixtures/users.ts`    | Delete                                                                                                                                |
| `resources/js/stays/fixtures/bookings.ts` | Delete, and load bookings from the server in `signIn`                                                                                 |
| `resources/js/stays/store.tsx`            | Replace the local storage session with the provider's session, and load saved properties, bookings and preferences from the server    |
| `resources/js/stays/screens/auth.tsx`     | Remove `DevCodeBanner` and `AuthDraft.code`, and replace the provider button messages with real sign-in                               |
| `resources/js/stays/validation.ts`        | Match `PASSWORD_RULES` to the provider's rules                                                                                        |

Database accounts already sign in through Laravel Fortify, so the remaining work is email codes, sign-up and password reset.

## Properties and photos

- **Locations:** 84 fictional properties across 12 UK destinations, with 18 in London and 6 each in Manchester, Edinburgh, Liverpool, Bristol, Bath, York, Brighton, Glasgow, Cardiff, Birmingham and Oxford. `UkPropertySeeder` puts them in the database and `GET /stays/properties` serves them. The app no longer generates hotels in the browser.
- **Names and addresses:** the names are fictional. Addresses stop at an area and postcode district, such as "Shoreditch, London E1", so none points at a real building.
- **Photos:** 40 openly licensed photos (CC0 or public domain) from Openverse, in `database/seeders/assets/properties/`. I reviewed each one by eye to exclude people, logos, branded hotels, vintage shots and damaged rooms. `credits.json` records each creator, license and source. Properties share photos from this set. The property page no longer shows a photo credit line, since every photo is CC0 or public domain and needs no credit. `credits.json` still records where each one came from.
- **Prices:** these are in pounds. The amounts keep the same numbers as before, so London prices are close to the earlier ones.
- **Majestic Inn Liverpool:** this is unlisted, so it doesn't appear in search, because it's a real business and made-up ratings would misrepresent it. It still shows in the seeded user's trips.
- **Majestic Inn photos:** the only real photos of the building online are its listing photos on travel sites, and those belong to the property and the platforms. No openly licensed photo of it exists. Its trip card instead shows three plain double rooms from the CC0 set, matching its Double Room with Shared Bathroom. To use your own photos, replace the file names in `StayBookingSeeder::seedPhotos()`.
- **Reviews:** subscores and guest quotes are still derived in the browser, because they aren't stored.
- **Loading:** the splash screen waits for the catalogue, up to its 1.5 second limit. If loading fails, search and the destination list say so and offer a retry.

## Home screen

The layout follows the three reference screenshots, on a white page. The blue header stays, as the guide's light theme uses it, and the search panel overlaps its bottom edge.

| Screenshot                                        | Used                                                    |
| ------------------------------------------------- | ------------------------------------------------------- |
| Booking.com wordmark, "Why Booking.com?"          | Lodgely wordmark, "Why Lodgely?"                        |
| Genius card and "Genius Level 1"                  | "Lodgely Rewards" and "Level 1"                         |
| Genius badge on hotels                            | "Member" badge                                          |
| George Residence TLC, Go2Hotel45 and their photos | Fictional London properties with openly licensed photos |
| Offer and "Why" artwork                           | Original illustrations and icons                        |
| Dark navy "Why" cards                             | Pale blue `actionTint` cards                            |

- **Search without a destination:** this opens the destination picker. If a reload clears the destination while on results, that screen asks for one.
- **Pending review:** shows the first completed stay with no score, and only when signed in. Picking a score saves it on this device and removes the card.
- **Weekend deals:** these are London properties for the coming Friday to Sunday. Tapping a card applies those dates and opens the property. Your screenshot cuts the cards off below the badge, so the price line is my addition.
- **Free cancellation card:** the screenshot cuts this text off, so its ending is written to fit.
- **Scrolling:** the wordmark and service tabs stay fixed, and the search panel slides under them.
- **Header icons, Rewards and discounts:** these open placeholder screens, the account page or sign-in. Car rental, Taxi and Attractions show a short message.

## App name and home-screen use

- **App name:** `APP_NAME` in `.env` names the app everywhere: the page title, splash screen, home-screen name (`/manifest.webmanifest` is generated from it), and every screen that says the name. The page writes it into a meta tag, and `theme.ts` reads it from there, so changing it only needs a reload, not a rebuild. A running `composer run dev` has to be restarted to see a change, because it copies `.env` when it starts.
- **App icon:** generated from `APP_NAME`: the full name in white on #013b96 (`icon_color` in `config/stays.php`), sized to fit the icon's width. Long names get smaller text. At the 16px tab size the name is very small, which is the cost of showing it in full. The same icon serves as `favicon.svg` and `favicon.ico` for browser tabs, `apple-touch-icon.png` for iPhone home screens, and the 192 and 512 PNGs in the manifest. Pages link to them with a `?v=` that changes with the name, so browsers fetch the new icon. The PNGs use DejaVu Sans Bold from `resources/fonts/`, under its own free licence. The brand colours are in `config/stays.php`. iOS keeps the old home-screen icon until the app is removed and added again.
- **Home-screen app on iPhone:** the status bar is opaque black (`apple-mobile-web-app-status-bar-style` set to `black`), not translucent. With a translucent status bar, iOS 26 lays out home-screen web apps shorter than the screen and leaves a strip under the tab bar that the page can't draw into. Stretching the app doesn't help, because the stretched part is clipped. The cost is that the status bar is black above the blue header, instead of blue. The stay details header no longer adds the status-bar space twice when it sticks to the top. iOS only picks up these settings when the app is removed from the home screen and added again.

## Seeded account details

`StayBookingSeeder` gives Chukwunonso Eze the details from the reference screenshots:

- **Profile:** gender "I am a man", and phone +447881174218. Date of birth, passport, address, display name and nationality are left empty.
- **Saved card:** Mastercard ending 9633, expiring 11-2030.
- **Payment:** £28.10 for accommodation at Majestic Inn Liverpool on 29 Oct 2026 at 23:55, paid with a different Mastercard, ending 2931, as in the reference.
- **Wallet balance:** £0.

## Trips and stay details

The layout follows the five reference screenshots, on a white background as requested.

**From the reference booking, seeded into the database by `StayBookingSeeder`:** Liverpool, Majestic Inn Liverpool, 29 to 30 Oct 2026, £28.10, check-in 15:00 - 0:00, check-out 8:00 - 10:00, 94 Hawthorne Road, Liverpool, L20 9JX, +44 7979399678, Double Room with Shared Bathroom, Chukwunonso Eze, chukwunonsoeze053@gmail.com, non-refundable terms.

**Changed from the screenshots, to keep other brands out:**

| Screenshot                           | Used                                 |
| ------------------------------------ | ------------------------------------ |
| Booking.com wordmark                 | Lodgely wordmark                     |
| "You paid with Booking.com"          | "You paid with Lodgely"              |
| "13% Genius discount"                | "13% member discount"                |
| Genius badge on Attractions          | "Member" badge                       |
| Hotel, attraction and survey artwork | Original illustrations drawn in code |

**Placeholders the screenshots don't show:**

| Field                              | Placeholder                                                                                                                                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reference                          | LD-90214738                                                                                                                                                          |
| Second survey question             | "The details of my booking were easy to understand", because the card reads "1 of 2" and only one question was visible                                               |
| Property page (Rebook, Book again) | A $36 nightly price and no taxes, since the app's search prices are in US dollars. Stars, reviews and facilities aren't known, so they're hidden rather than made up |
| Other trips                        | Mock stays in `fixtures/bookings.ts`, shown under Active and Cancelled                                                                                               |
| Other properties' phone            | +44 20 0000 0000, labeled as a placeholder on screen                                                                                                                 |

**Decisions:**

- **Database:** the `properties` and `bookings` tables hold what the booking shows. `GET /stays/trips` returns only the signed-in user's bookings.
- **Seeded account:** `chukwunonsoeze053@gmail.com`, with a local password set in `StayBookingSeeder`. The seeder is safe to re-run and does nothing in production, because a known password on a real email address must never reach a live site.
- **Sign-in:** an email found in the database goes straight to the password screen and signs in through the app's own endpoint, `POST /stays/session`, because the code step has no real inbox behind it. Fortify's `/login` isn't used, because it refuses anyone already signed in to the starter kit, and the app reported that as a wrong password. The endpoint replaces any signed-in account, throttles repeated attempts, and won't sign in accounts that use two-factor authentication. Everything else in the flow is still mock, including `alex.morgan@example.com`, which still has mock trips.
- **Account lookup:** `POST /stays/account-lookups` tells anyone whether an email has an account. It's rate limited, but this needs rethinking before a public launch.
- **Local storage:** database bookings stay out of it and are fetched on each launch. The signed-in user's name and email are kept there so the session survives a restart.
- **White theme:** the dark values and dark mode switch were removed, and the Bookings tab uses the same light tokens as the rest of the app. The screenshot colors are mapped to their light equivalents, such as `#006ce4` for links and `#008234` for "completed".
- **Bottom bar:** it keeps the earlier spec, with outline icons and color only for the active tab, rather than the filled suitcase in the screenshots.
- **Rate your stay:** only shown on completed stays. **Cancel (mock):** only offered on active trips, with a confirmation step first.
- **Downloads:** Download receipt and Save your confirmation save a `.txt` summary of that booking.
- **Sharing:** rows use the browser's native share sheet, and browsers without one copy the link instead. Shared text leaves out the guest's name, email and reference.
- **Cancelled stays:** these show $0 paid.
- **Development note:** the stay page shows a short note about placeholder data in development only. This file isn't served by the app.
- **Older sessions:** the storage key changed, so anyone signed in before this update has to sign in again to get the new seed data.

## Technical decision: no Inertia on this page

The rest of the project uses Inertia, but this page mounts React from its own Blade view (`resources/views/stays.blade.php`) and Vite entry (`resources/js/stays/main.tsx`). Inertia remounts the page on every browser back, which wiped search state and saved hearts. The prototype has no server data, so it doesn't need Inertia. If it later needs real data, this should be revisited.
