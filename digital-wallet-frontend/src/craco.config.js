module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve("crypto-browserify"),
        zlib: require.resolve("browserify-zlib"),
        querystring: require.resolve("querystring-es3"),
        path: require.resolve("path-browserify"),
        stream: require.resolve("stream-browserify"),
        fs: false,
        http: require.resolve("stream-http"),
      };
      return webpackConfig;
    },
  },
};
