const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer = {
    ...config.transformer,
    minifierConfig: {
        keep_classnames: true, // Preserve class names
        keep_fnames: true,     // Preserve function names
    },
};

module.exports = config;
