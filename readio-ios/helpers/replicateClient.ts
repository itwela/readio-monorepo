

import Constants from 'expo-constants';
import Replicate from "replicate";

// if ( !Constants.expoConfig?.extra?.REPLICATE_API_TOKEN_1 || !Constants.expoConfig?.extra?.REPLICATE_API_TOKEN_2 ) {
//     throw new Error("Replicate AI credentials not found in expo config");
// }
// const extra = Constants.expoConfig.extra;
// const replicateApiKeyParts = [
//     extra.REPLICATE_API_TOKEN_1,
//     extra.REPLICATE_API_TOKEN_2,
// ];
// const reconstructKey = (parts: string[]) => {
//     console.log(parts);
//     return parts.join("");
// };

const {
    REPLICATE_API_TOKEN
} = Constants?.expoConfig?.extra || {};

const replicateApiKey = REPLICATE_API_TOKEN;





const replicateClient = new Replicate({auth: replicateApiKey});

export const replicate = replicateClient;

