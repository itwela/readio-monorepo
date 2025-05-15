// <!-- Table Of Contents For WHen I Forget How To Do Stuff + Tips -->

// NOTE 🟩 = VARIABLE
// NOTE 🟦 = COMPONENT
// NOTE 🟨 = USEEFFECT
// NOTE 🟪 = FUNCTION
// NOTE 🟥 = DEBUG

// WHAT TO SEARCH TO SWITCH FROM DEBUG SIGNUP USER TO REAL USER
// masterDebugMode
//  const {masterDebugMode} = useLotusUtils()

// Tab Navigator: Hiding a screen from the tab bar but still being able to navigate to it
// LINK readio-ios/app/(tabs)/_layout.tsx:390

// HOW TO DECIDE IF A USER IS PAID OR NOT:
// const isUserAPayedSubscriber = user?.subscription_plan !== 'blank' || user?.user_role === 'admin';

// HOW TO DECIDE IF A USER IS SPECIFICALLY PREMIUM OR NOT:
// const isUserPremium = user?.subscription_plan === 'premium' || user?.user_role === 'admin';

// ALL PLACES THAT WILL NEED CONTENT TYPE UPDATES
// LINK readio-ios/helpers/providers/lotusPlayTrackingProvider.tsx:66
// LINK readio-ios/types/type.d.ts:20

// ALL PLACES THAT VIDEOS PLAY IN THE APP:
// LINK readio-ios/components/LotusHeader.tsx:227
// LINK readio-ios/app/(tabs)/(home)/home.tsx:288
// LINK readio-ios/app/(auth)/welcome.tsx:35
// LINK readio-ios/app/(auth)/sign-up.tsx:61
