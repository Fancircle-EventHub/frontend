# eventees native

Expo / React Native starter with shared event search, profile visibility rules and typed API client in `../lib/eventees`.

```sh
npm ci
npm start
npm run ios
npm run android
npx tsc --noEmit
npx expo export --platform ios --platform android
```

An Expo development build or matching Expo Go version is needed to run on a device. iOS simulator requires macOS. Store signing and accounts are not configured.

Includes discover, saved events, example event hub, matching fans, per-event privacy switches, local meetups, ride offers/interests, gallery selection, local chat, document selection and ticket camera capture. All events/fans are fictional. Nothing is uploaded or sent. A local ticket selection is never treated as a valid admission credential.

Metro watches the repository root for shared domain code and image assets. API credentials must come from a secure authenticated session; never add secrets to Expo public variables. Bundle identifiers `io.fancircle.eventees` are placeholders until account ownership is confirmed. Native local data currently lasts only for the app session. No physical-device QA has been performed yet.

Navigation uses Expo Router under `src/app/`; state is shared by the root provider. The component tree was also exercised through the web renderer, including save and navigation. Native device verification remains pending. Requires Node.js 22.13 or newer.
